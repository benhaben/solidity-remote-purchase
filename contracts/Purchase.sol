pragma solidity >=0.4.21 <=0.7.0;


contract Purchase {
    uint public value;
    address payable public  seller;
    address payable public  buyer;
    enum State {Created, Locked, Inactive}
    State public state;

    // this.balance表示合约账户的余额。payable表示该动作需要支付以太币，支付的数量会累加到合约账户的余额。
    // seller 调用此方法
    constructor() public payable {
        seller = msg.sender;
        // 押金 + 价钱
        value = msg.value / 2;
        require((2 * value) == msg.value, "Value has to be even.");
    }

    function getValue() external view returns (uint){
        return value;
    }

    function getState() external view returns (State){
        return state;
    }

    modifier condition(bool _condition, string memory _error) {
        require(_condition, _error);
        _;
    }

    modifier onlyBuyer() {
        require(msg.sender == buyer, "only buyer");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "only seller");
        _;
    }

    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    event Aborted();
    event PurchaseConfirmed();
    event ItemReceived(uint buyerReceivedValue, uint sellerReceivedValue);

    ///中止购买并回收以太币。
    ///只能在合约被锁定之前由卖家调用。
    function abort()
    public
    onlySeller
    inState(State.Created)
    {
        emit Aborted();
        state = State.Inactive;
        seller.transfer(address(this).balance);
    }

    /// 买家确认购买。
    /// 交易必须包含 `2 * value` 个以太币。
    /// 以太币会被锁定，直到 confirmReceived 被调用。
    function confirmPurchase()
    public
    inState(State.Created)
    condition(msg.value == (2 * value), "do not send right money")
    payable
    {
        emit PurchaseConfirmed();
        buyer = msg.sender;
        state = State.Locked;
    }
    /// 确认你（买家）已经收到商品。
    /// 这会释放被锁定的以太币。
    function confirmReceived()
    public
    onlyBuyer
    inState(State.Locked)
    {
        state = State.Inactive;
        uint buyerReceivedValue = value;
        buyer.transfer(value);
        uint sellerReceivedValue = address(this).balance;
        seller.transfer(sellerReceivedValue);
        emit ItemReceived(buyerReceivedValue, sellerReceivedValue);
    }
}