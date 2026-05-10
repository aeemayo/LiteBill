export const LITEBILL_ABI = [
  'function createBill(address _payee, uint256 _totalAmount, uint256 _participantCount) external returns (uint256)',
  'function createBillWithExpiry(address _payee, uint256 _totalAmount, uint256 _participantCount, uint256 _expiresAt) external returns (uint256)',
  'function contribute(uint256 _billId) external payable',
  'function cancelBill(uint256 _billId) external',
  'function claimRefund(uint256 _billId) external',
  'function getBillStatus(uint256 _billId) external view returns (address creator, address payee, uint256 totalAmount, uint256 shareAmount, uint256 totalContributed, uint256 contributors, uint256 participantCount, bool settled)',
  'function getBillTiming(uint256 _billId) external view returns (uint256 expiresAt, bool cancelled, bool expired)',
  'event BillCreated(uint256 indexed billId, address indexed creator, address indexed payee, uint256 totalAmount, uint256 shareAmount, uint256 participantCount)',
  'event ContributionMade(uint256 indexed billId, address indexed contributor, uint256 amount)',
  'event BillSettled(uint256 indexed billId, uint256 settledAmount)',
  'event BillCancelled(uint256 indexed billId)',
  'event RefundClaimed(uint256 indexed billId, address indexed contributor, uint256 amount)'
]
