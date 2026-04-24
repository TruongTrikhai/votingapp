# React Voting Application

Dự án này là một DApp (Decentralized Application) bầu cử toàn diện được xây dựng trên nền tảng **React**, **Hardhat v2**, **Ethers v6**, **TypeScript**, và sử dụng các tiêu chuẩn bảo mật của **OpenZeppelin**. Quá trình triển khai hợp đồng thông minh được thực hiện qua **Hardhat Ignition**.

## 1. Cài đặt (Installation)

Sau khi clone dự án về máy, hãy cài đặt các thư viện cần thiết:

```shell
npm install
```

## 2. Kiểm thử (Testing)

Dự án bao gồm một bộ Unit Tests toàn diện (viết bằng TypeScript + Mocha + Chai) với độ bao phủ cao, kiểm tra tất cả các logic từ khởi tạo, cấp quyền (Ownable), cho đến kiểm soát thời gian bỏ phiếu.

Để chạy bộ kiểm thử:
```shell
npx hardhat test
```

## 3. Triển khai Smart Contract (Deployment)

Việc triển khai được cấu hình tự động thông qua Hardhat Ignition.

**Bước 1:** Tạo một file `.env` ở **thư mục gốc** của dự án (nếu chưa có) và điền các cấu hình của bạn:
```env
PRIVATE_KEY=your_private_key_here
API_URL=your_rpc_url_here
```
*(Lưu ý: Không bao giờ commit file `.env` lên Github).*

**Bước 2:** Chọn môi trường deploy:

*   **Deploy lên mạng Localhost (Mạng giả lập Hardhat):**
    Mở một terminal và khởi chạy Node:
    ```shell
    npx hardhat node
    ```
    Mở terminal thứ 2 và chạy script triển khai:
    ```shell
    npx hardhat ignition deploy ./ignition/modules/Voting.ts --network localhost
    ```

*   **Deploy lên Testnet (Ví dụ: Sepolia):**
    ```shell
    npx hardhat ignition deploy ./ignition/modules/Voting.ts --network sepolia
    ```

## 4. Chạy giao diện Frontend (React)

Sau khi hợp đồng thông minh được triển khai, hãy **sao chép địa chỉ hợp đồng (Contract Address)** hiển thị trên terminal.

1. Vào file hằng số (thường nằm ở `src/Constant/constant.js` hoặc file `.env` của React).
2. Dán địa chỉ hợp đồng mới vào biến `contractAddress`.
3. Lưu lại và khởi động giao diện React:

```shell
npm start
```

Ứng dụng sẽ tự động mở lên tại `http://localhost:3000`. Hãy đảm bảo ví Metamask của bạn đã được chuyển sang đúng mạng lưới mà bạn vừa deploy.

---

# BÁO CÁO CHI TIẾT DỰ ÁN: ỨNG DỤNG BỎ PHIẾU PHI TẬP TRUNG (DApp Voting)

---

## Phần 1: Phân tích & Thiết kế (Design Phase)

### 1.1. Xác định Business Flow (Luồng nghiệp vụ)

#### 1.1.1. Tổng quan hệ thống

Ứng dụng Decentralized Voting Application (DApp Voting) là một hệ thống bỏ phiếu phi tập trung được xây dựng trên nền tảng Blockchain Ethereum. Hệ thống cho phép người dùng bỏ phiếu cho các ứng cử viên một cách minh bạch, không thể gian lận, và có thể kiểm chứng công khai nhờ vào tính bất biến của Blockchain.

**Các bên tham gia (Actors):**

| Actor | Vai trò | Mô tả |
|-------|---------|-------|
| **Owner (Quản trị viên)** | Người khởi tạo hợp đồng | Là tài khoản triển khai (deploy) Smart Contract. Có quyền thêm ứng cử viên mới. Được xác thực thông qua cơ chế `Ownable` của OpenZeppelin. |
| **Voter (Cử tri)** | Người bỏ phiếu | Là bất kỳ địa chỉ ví Ethereum nào kết nối với ứng dụng thông qua Metamask. Mỗi địa chỉ chỉ được phép bỏ phiếu **đúng một lần** (One-person-one-vote). |
| **Smart Contract** | Bộ xử lý trung tâm | Là hợp đồng thông minh `Voting.sol` được triển khai trên Blockchain. Chịu trách nhiệm lưu trữ dữ liệu, xác thực logic và thực thi quy tắc bỏ phiếu. |

#### 1.1.2. Luồng đi của dữ liệu (Data Flow)

```
┌─────────────┐    Deploy Contract     ┌──────────────────┐
│   Owner      │ ─────────────────────▶ │  Blockchain      │
│  (Deployer)  │    (candidateNames,    │  (Ethereum/      │
│              │     durationInMinutes) │   Sepolia)       │
└──────┬───────┘                        └────────┬─────────┘
       │                                         │
       │  addCandidate(_name)                    │
       │ ───────────────────────────────────────▶│
       │        [chỉ Owner]                      │
       │                                         │
┌──────┴───────┐                        ┌────────┴─────────┐
│   Voter      │    vote(index)         │  Smart Contract  │
│  (Cử tri)   │ ─────────────────────▶ │  Voting.sol      │
│              │                        │                  │
│              │ ◀───────────────────── │  - candidates[]  │
│              │   getAllVotesOfCandiates│  - voters{}      │
│              │   getVotingStatus()    │  - votingStart   │
│              │   getRemainingTime()   │  - votingEnd     │
└──────────────┘                        └──────────────────┘
```

**Chi tiết luồng dữ liệu:**

1. **Giai đoạn Khởi tạo (Initialization):**
   - Owner triển khai Smart Contract với 2 tham số: danh sách tên ứng cử viên (`_candidateNames`) và thời lượng bỏ phiếu tính bằng phút (`_durationInMinutes`).
   - Contract tự động ghi nhận `votingStart = block.timestamp` (thời điểm hiện tại) và `votingEnd = block.timestamp + (_durationInMinutes * 1 minutes)`.
   - Mỗi ứng cử viên được khởi tạo với `voteCount = 0`.

2. **Giai đoạn Bỏ phiếu (Voting):**
   - Voter kết nối ví Metamask với giao diện React.
   - Frontend gọi hàm `getVotingStatus()` để kiểm tra phiên bỏ phiếu còn mở hay đã đóng.
   - Frontend gọi hàm `voters(address)` để kiểm tra Voter đã bỏ phiếu chưa.
   - Nếu hợp lệ, Voter chọn chỉ số (index) ứng cử viên và gửi giao dịch `vote(index)`.
   - Smart Contract xác thực 3 điều kiện → nếu hợp lệ → tăng `voteCount` của ứng cử viên lên 1 và đánh dấu `voters[msg.sender] = true`.

3. **Giai đoạn Kết thúc (Finished):**
   - Khi `block.timestamp >= votingEnd`, hàm `getVotingStatus()` trả về `false`.
   - Frontend hiển thị giao diện `Finished` thông báo phiên bỏ phiếu đã kết thúc.
   - Mọi giao dịch `vote()` sau thời điểm này sẽ bị revert với lỗi `"Voting is closed."`.

#### 1.1.3. Điều kiện kích hoạt giao dịch

| Hàm | Người gọi | Điều kiện (require) | Mô tả |
|-----|-----------|---------------------|-------|
| `constructor()` | Owner | Không có điều kiện đặc biệt | Chỉ chạy một lần duy nhất khi deploy |
| `addCandidate()` | Owner | `onlyOwner` (modifier OpenZeppelin) | Chỉ Owner mới được thêm ứng cử viên |
| `vote()` | Voter | ① `!voters[msg.sender]` — Chưa bỏ phiếu; ② `_candidateIndex < candidates.length` — Index hợp lệ; ③ `block.timestamp >= votingStart && block.timestamp < votingEnd` — Trong thời gian bỏ phiếu | Bỏ phiếu cho ứng cử viên |
| `getAllVotesOfCandiates()` | Bất kỳ ai | Không có (view function) | Đọc dữ liệu, không tốn Gas |
| `getVotingStatus()` | Bất kỳ ai | Không có (view function) | Đọc trạng thái |
| `getRemainingTime()` | Bất kỳ ai | `block.timestamp >= votingStart` | Đọc thời gian còn lại |

#### 1.1.4. Cơ chế khóa và giải phóng tài sản

Trong hệ thống bỏ phiếu này, **"tài sản" chính là quyền bỏ phiếu (voting right)** của mỗi địa chỉ ví:

- **Trạng thái ban đầu (Unlocked):** Mỗi địa chỉ Ethereum đều có quyền bỏ phiếu (`voters[address] = false`, tức là chưa sử dụng quyền).
- **Sau khi bỏ phiếu (Locked):** Quyền bỏ phiếu bị **khóa vĩnh viễn** (`voters[address] = true`). Không có cơ chế giải phóng — đây là thiết kế có chủ đích để đảm bảo tính công bằng "một người một phiếu".
- **Thời gian bỏ phiếu (Time-locked):** Toàn bộ phiên bỏ phiếu bị khóa bởi `votingEnd`. Sau thời điểm này, không ai có thể bỏ phiếu thêm, bất kể họ đã sử dụng quyền hay chưa.

> **Lưu ý:** Hệ thống hiện tại không liên quan đến việc chuyển token hay ETH, nên không có cơ chế escrow hay khóa tài sản tài chính.

---

### 1.2. Thiết kế tính năng — Phân rã Module

Hệ thống được chia thành **3 module chính** (on-chain) và **3 module phụ** (off-chain/frontend):

#### Module On-chain (Smart Contract)

```
┌─────────────────────────────────────────────────────┐
│                  Voting.sol                          │
│  ┌───────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │  Module Quản  │ │ Module Xử lý │ │ Module Truy │ │
│  │  trị (Admin)  │ │  Bỏ phiếu    │ │ vấn (Query) │ │
│  │               │ │  (Voting)    │ │             │ │
│  │ - constructor │ │ - vote()     │ │ - getAll..()│ │
│  │ - addCandidate│ │ - voters{}   │ │ - getStatus │ │
│  │ - Ownable     │ │              │ │ - getTime() │ │
│  └───────────────┘ └──────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Module 1: Quản trị (Admin Module)**

| Thành phần | Chi tiết |
|------------|----------|
| **Kế thừa** | `Ownable` từ OpenZeppelin v5 (`@openzeppelin/contracts/access/Ownable.sol`) |
| **Hàm `constructor()`** | Nhận danh sách ứng cử viên và thời lượng bỏ phiếu. Gọi `Ownable(msg.sender)` để đặt Owner. Khởi tạo mảng `candidates[]` và thiết lập `votingStart`, `votingEnd`. |
| **Hàm `addCandidate()`** | Modifier `onlyOwner` đảm bảo chỉ Owner gọi được. Thêm ứng cử viên mới vào mảng `candidates[]` với `voteCount = 0`. |
| **Bảo mật** | Sử dụng custom error `OwnableUnauthorizedAccount` (OpenZeppelin v5) thay vì chuỗi lỗi để tiết kiệm Gas. |

**Module 2: Xử lý Bỏ phiếu (Voting Module)**

| Thành phần | Chi tiết |
|------------|----------|
| **Hàm `vote()`** | Nhận `_candidateIndex` (uint256). Kiểm tra 3 điều kiện: chưa bỏ phiếu, index hợp lệ, trong thời gian cho phép. Tăng `voteCount` và đánh dấu đã bỏ phiếu. |
| **Mapping `voters`** | `mapping(address => bool)` — Lưu trạng thái bỏ phiếu của mỗi địa chỉ. |
| **Nguyên tắc** | Tuân thủ mô hình **Checks-Effects-Interactions**: kiểm tra điều kiện trước, cập nhật state sau, không có external call. |

**Module 3: Truy vấn (Query Module)**

| Thành phần | Chi tiết |
|------------|----------|
| **`getAllVotesOfCandiates()`** | Trả về toàn bộ mảng `candidates[]` (view, không tốn Gas khi gọi off-chain). |
| **`getVotingStatus()`** | Trả về `bool` — `true` nếu đang trong thời gian bỏ phiếu, `false` nếu đã hết. |
| **`getRemainingTime()`** | Trả về `uint256` — số giây còn lại. Trả về `0` nếu đã hết thời gian. |

#### Module Off-chain (Frontend React)

**Module 4: Kết nối Ví (Wallet Connection Module)** — File: `App.js`, `Login.jsx`

- Sử dụng `ethers.BrowserProvider(window.ethereum)` để kết nối Metamask.
- Lắng nghe sự kiện `accountsChanged` để xử lý khi người dùng đổi tài khoản.
- Quản lý state: `isConnected`, `account`, `provider`.

**Module 5: Hiển thị & Tương tác (UI Module)** — File: `Connected.jsx`, `Finished.jsx`

- `Connected.jsx`: Hiển thị bảng ứng cử viên, form nhập index, nút Vote, thời gian còn lại.
- `Finished.jsx`: Hiển thị thông báo kết thúc khi `votingStatus = false`.
- Đếm ngược thời gian thực (countdown) mỗi giây ở phía Frontend.

**Module 6: Giao tiếp Contract (Contract Interaction Module)** — File: `App.js`, `constant.js`

- `constant.js`: Lưu trữ ABI và địa chỉ Contract (địa chỉ đọc từ biến môi trường `REACT_APP_CONTRACT_ADDRESS`).
- Các hàm async trong `App.js`: `getCandidates()`, `getCurrentStatus()`, `getRemainingTime()`, `canVote()`, `vote()`.

---

### 1.3. Data Modeling (Mô hình dữ liệu On-chain)

#### 1.3.1. Struct — Cấu trúc dữ liệu

Hệ thống chỉ định nghĩa **1 struct duy nhất** để tối ưu Gas:

```solidity
struct Candidate {
    string name;       // Tên ứng cử viên (kiểu string, lưu trữ động)
    uint256 voteCount; // Số phiếu bầu (kiểu uint256, 32 bytes cố định)
}
```

**Phân tích chi phí lưu trữ:**
- `name` (string): Là kiểu dữ liệu động, tốn kém Gas khi lưu trữ. Tuy nhiên, đây là thông tin thiết yếu để nhận diện ứng cử viên nên bắt buộc phải lưu on-chain.
- `voteCount` (uint256): 32 bytes, chiếm đúng 1 storage slot. Hiệu quả về Gas.

#### 1.3.2. Biến trạng thái (State Variables)

```solidity
// --- Storage Layout ---

Candidate[] public candidates;           // Slot 0: Mảng động chứa danh sách ứng cử viên
mapping(address => bool) public voters;  // Slot 1: Tra cứu trạng thái bỏ phiếu O(1)
uint256 public votingStart;              // Slot 2: Thời điểm bắt đầu (Unix timestamp)
uint256 public votingEnd;                // Slot 3: Thời điểm kết thúc (Unix timestamp)
// address private _owner;               // Slot kế thừa từ Ownable (OpenZeppelin)
```

| Biến | Kiểu | Storage Slot | Mục đích | Chi phí Gas |
|------|------|-------------|----------|-------------|
| `candidates` | `Candidate[]` | Slot 0 (dynamic) | Lưu danh sách ứng cử viên và số phiếu | ~20,000 Gas/lần thêm mới (SSTORE) |
| `voters` | `mapping(address => bool)` | Slot 1 (mapping) | Ngăn bỏ phiếu trùng lặp | ~20,000 Gas/lần ghi mới |
| `votingStart` | `uint256` | Slot 2 | Mốc thời gian bắt đầu | ~20,000 Gas (ghi 1 lần khi deploy) |
| `votingEnd` | `uint256` | Slot 3 | Mốc thời gian kết thúc | ~20,000 Gas (ghi 1 lần khi deploy) |

#### 1.3.3. Nguyên tắc tối ưu Gas đã áp dụng

1. **Chỉ lưu dữ liệu thiết yếu:** Chỉ lưu `name` và `voteCount` cho mỗi ứng cử viên. Không lưu thông tin dư thừa như mô tả, hình ảnh, hay lịch sử phiếu.
2. **Sử dụng `mapping` thay vì mảng cho `voters`:** Tra cứu `mapping` có độ phức tạp O(1), không tốn Gas tuyến tính như duyệt mảng.
3. **Hàm `view` không tốn Gas:** Các hàm `getAllVotesOfCandiates()`, `getVotingStatus()`, `getRemainingTime()` đều là `view` — khi gọi từ off-chain (Frontend) thì **hoàn toàn miễn phí Gas**.
4. **Sử dụng `uint256`:** Tuy có thể dùng `uint128` cho `voteCount`, nhưng EVM xử lý `uint256` tự nhiên nhất (1 word = 32 bytes). Việc ép kiểu nhỏ hơn có thể tốn thêm Gas do phải thực hiện phép AND mask.
5. **Kế thừa OpenZeppelin Ownable:** Tận dụng thư viện đã được audit thay vì tự viết logic kiểm tra quyền, vừa an toàn vừa tiết kiệm Gas nhờ custom error trong v5.

#### 1.3.4. Sơ đồ quan hệ dữ liệu (Entity Relationship)

```
┌──────────────────┐         ┌──────────────────────┐
│  Voting Contract │         │  Candidate (struct)  │
│──────────────────│    1:N  │──────────────────────│
│ votingStart      │────────▶│ name: string         │
│ votingEnd        │         │ voteCount: uint256   │
│ _owner (Ownable) │         └──────────────────────┘
│──────────────────│
│ voters (mapping) │────────▶  address => bool
│                  │              (1:1 per address)
└──────────────────┘
```

**Quan hệ:**
- **Contract → Candidates**: Quan hệ 1:N (một Contract chứa nhiều Candidate), lưu trong mảng động `candidates[]`.
- **Contract → Voters**: Quan hệ 1:1 (mỗi địa chỉ ví chỉ có một trạng thái bỏ phiếu), lưu trong `mapping(address => bool)`.

---

## Phần 2: Thiết kế Smart Contract (Architectural Design)

### 2.1. Phân rã Contract (Contract Decomposition)

#### 2.1.1. Kiến trúc hiện tại (Monolithic)

Hệ thống hiện tại sử dụng kiến trúc **đơn thể (Monolithic)** — toàn bộ logic và dữ liệu được gói gọn trong **một file duy nhất** `Voting.sol`, kế thừa `Ownable` từ OpenZeppelin:

```
┌─────────────────────────────────────────┐
│            Voting.sol                    │
│  ┌─────────────────────────────────────┐ │
│  │  OpenZeppelin Ownable (kế thừa)    │ │
│  │  - _owner                           │ │
│  │  - onlyOwner modifier              │ │
│  │  - transferOwnership()             │ │
│  └─────────────────────────────────────┘ │
│                                          │
│  Storage (Dữ liệu):                     │
│  - candidates[] (Candidate struct)       │
│  - voters mapping                        │
│  - votingStart, votingEnd                │
│                                          │
│  Logic (Nghiệp vụ):                     │
│  - constructor()                         │
│  - addCandidate()                        │
│  - vote()                                │
│                                          │
│  View (Truy vấn):                        │
│  - getAllVotesOfCandiates()               │
│  - getVotingStatus()                     │
│  - getRemainingTime()                    │
└──────────────────────────────────────────┘
```

**Ưu điểm của kiến trúc hiện tại:**
- Đơn giản, dễ hiểu, phù hợp cho dự án quy mô nhỏ.
- Chi phí deploy thấp hơn so với kiến trúc nhiều contract (chỉ 1 lần deploy).
- Không cần quản lý cross-contract calls, giảm rủi ro bảo mật.

**Hạn chế:**
- Không thể nâng cấp (upgrade) logic mà không mất dữ liệu — phải deploy lại toàn bộ contract mới.
- Khó mở rộng khi hệ thống phát triển phức tạp hơn.

#### 2.1.2. Kiến trúc đề xuất (Modular — Nếu mở rộng)

Nếu hệ thống cần mở rộng trong tương lai (ví dụ: nhiều phiên bỏ phiếu, quản trị DAO, token hóa phiếu bầu), kiến trúc nên được phân rã thành các thành phần sau:

```
┌──────────────────────────────────────────────────────────────┐
│                    Kiến trúc Modular (Đề xuất)                │
│                                                               │
│  ┌─────────────────┐    implements    ┌────────────────────┐  │
│  │  IVoting         │◀───────────────│  Voting             │  │
│  │  (Interface)     │                 │  (Core Contract)    │  │
│  │                  │                 │                     │  │
│  │  + vote()        │                 │  Logic nghiệp vụ:  │  │
│  │  + addCandidate()│                 │  - vote()           │  │
│  │  + getAll...()   │                 │  - addCandidate()   │  │
│  │  + getStatus()   │                 │  - getAll...()      │  │
│  │  + getTime()     │                 │  - getStatus()      │  │
│  └─────────────────┘                 │  - getTime()        │  │
│                                       │                     │  │
│                                       │  Kế thừa:          │  │
│                                       │  - Ownable          │  │
│  ┌─────────────────┐    reads/writes  │  - VotingStorage    │  │
│  │ VotingStorage    │◀───────────────│                     │  │
│  │ (Storage Contract│                 └────────────────────┘  │
│  │  / Abstract)     │                                         │
│  │                  │                                         │
│  │  - candidates[]  │                                         │
│  │  - voters{}      │                                         │
│  │  - votingStart   │                                         │
│  │  - votingEnd     │                                         │
│  └─────────────────┘                                         │
└──────────────────────────────────────────────────────────────┘
```

#### 2.1.3. Chi tiết từng thành phần

---

**① Interface: `IVoting` — Định nghĩa chuẩn kết nối**

Interface định nghĩa "hợp đồng giao tiếp" (API) mà mọi phiên bản của Voting Contract phải tuân thủ. Điều này cho phép Frontend hoặc các Contract khác tương tác mà không cần biết chi tiết triển khai bên trong.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVoting {
    // Struct definition (phải khai báo lại trong interface)
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    // Events — Ghi log các sự kiện quan trọng lên Blockchain
    event Voted(address indexed voter, uint256 indexed candidateIndex);
    event CandidateAdded(string name, uint256 index);

    // Core functions
    function vote(uint256 _candidateIndex) external;
    function addCandidate(string memory _name) external;

    // View functions
    function getAllVotesOfCandiates() external view returns (Candidate[] memory);
    function getVotingStatus() external view returns (bool);
    function getRemainingTime() external view returns (uint256);

    // State variables (auto-generated getters)
    function candidates(uint256 index) external view returns (string memory name, uint256 voteCount);
    function voters(address voter) external view returns (bool);
    function votingStart() external view returns (uint256);
    function votingEnd() external view returns (uint256);
}
```

**Vai trò của Interface:**
| Lợi ích | Mô tả |
|---------|-------|
| **Tiêu chuẩn hóa** | Đảm bảo mọi phiên bản Voting Contract đều cung cấp cùng một tập hàm |
| **Tính tương thích** | Frontend chỉ cần biết Interface, không cần biết chi tiết implement |
| **Khả năng nâng cấp** | Khi deploy contract mới, chỉ cần đảm bảo implement đúng Interface |
| **Kiểm thử** | Dễ dàng mock/stub trong Unit Test |

---

**② Storage Contract / Abstract: `VotingStorage` — Tách biệt dữ liệu**

Abstract contract chứa toàn bộ biến trạng thái (state variables). Mục đích: nếu cần nâng cấp logic, dữ liệu vẫn được giữ nguyên storage layout.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract VotingStorage {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    // ===== State Variables =====
    Candidate[] public candidates;
    mapping(address => bool) public voters;
    uint256 public votingStart;
    uint256 public votingEnd;

    // ===== Internal helper (chỉ contract con mới gọi được) =====
    function _isVotingOpen() internal view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }
}
```

**Vai trò của Storage Contract:**
| Lợi ích | Mô tả |
|---------|-------|
| **Tách biệt dữ liệu & logic** | Thay đổi logic (Core) mà không ảnh hưởng đến cấu trúc lưu trữ |
| **Chuẩn bị cho Proxy Pattern** | Nếu tương lai dùng Upgradeable Proxy, storage layout phải cố định |
| **Tái sử dụng** | Nhiều phiên bản Core Contract có thể kế thừa cùng Storage |

---

**③ Core Contract: `Voting` — Chứa logic chính**

Core Contract kế thừa `VotingStorage` và `Ownable`, implement `IVoting`. Chứa toàn bộ logic nghiệp vụ.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./VotingStorage.sol";
import "./IVoting.sol";

contract Voting is IVoting, VotingStorage, Ownable {

    constructor(
        string[] memory _candidateNames,
        uint256 _durationInMinutes
    ) Ownable(msg.sender) {
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
            emit CandidateAdded(_candidateNames[i], i);
        }
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate({ name: _name, voteCount: 0 }));
        emit CandidateAdded(_name, candidates.length - 1);
    }

    function vote(uint256 _candidateIndex) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");
        require(_isVotingOpen(), "Voting is closed.");

        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;

        emit Voted(msg.sender, _candidateIndex);
    }

    function getAllVotesOfCandiates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getVotingStatus() public view returns (bool) {
        return _isVotingOpen();
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }
}
```

**Cải tiến so với bản hiện tại:**
| Cải tiến | Chi tiết |
|----------|----------|
| **Events** | Thêm `Voted` và `CandidateAdded` để Frontend có thể lắng nghe sự kiện real-time |
| **Internal helper** | Dùng `_isVotingOpen()` từ Storage, tránh lặp code |
| **Interface compliance** | Implement `IVoting`, đảm bảo tương thích chuẩn |

---

### 2.2. Sơ đồ trạng thái (State Machine)

Hợp đồng Voting hoạt động như một **máy trạng thái hữu hạn (Finite State Machine)** với 3 trạng thái chính:

```
              Deploy Contract
                    │
                    ▼
    ┌───────────────────────────────┐
    │         INITIALIZED           │
    │  (Trạng thái Khởi tạo)       │
    │                               │
    │  • candidates[] được tạo      │
    │  • votingStart = now          │
    │  • votingEnd = now + duration │
    │  • voters{} rỗng              │
    │                               │
    │  Trigger: block.timestamp     │
    │           >= votingStart      │
    └───────────┬───────────────────┘
                │ (tự động, cùng block)
                ▼
    ┌───────────────────────────────┐
    │           ACTIVE              │
    │  (Trạng thái Đang bỏ phiếu)  │
    │                               │
    │  • getVotingStatus() = true   │
    │  • getRemainingTime() > 0     │
    │  • vote() ✅ được phép        │
    │  • addCandidate() ✅ (Owner)  │
    │                               │
    │  Hành động khả dụng:          │
    │  ├─ Voter gọi vote(index)     │
    │  │  → voteCount++             │
    │  │  → voters[addr] = true     │
    │  │                            │
    │  └─ Owner gọi addCandidate() │
    │     → candidates.push(...)    │
    │                               │
    │  Trigger: block.timestamp     │
    │           >= votingEnd        │
    └───────────┬───────────────────┘
                │ (tự động theo thời gian)
                ▼
    ┌───────────────────────────────┐
    │          FINISHED             │
    │  (Trạng thái Kết thúc)       │
    │                               │
    │  • getVotingStatus() = false  │
    │  • getRemainingTime() = 0     │
    │  • vote() ❌ bị revert        │
    │  • addCandidate() ✅ (Owner)  │
    │  • getAllVotes...() ✅ đọc    │
    │    kết quả cuối cùng          │
    │                               │
    │  ⚠ Trạng thái KHÔNG thể      │
    │    quay lại ACTIVE            │
    └───────────────────────────────┘
```

#### 2.2.1. Bảng chuyển trạng thái (State Transition Table)

| Trạng thái hiện tại | Sự kiện / Điều kiện | Trạng thái tiếp theo | Hành động |
|---------------------|---------------------|----------------------|-----------|
| — (Chưa tồn tại) | Owner deploy contract | **INITIALIZED → ACTIVE** | Khởi tạo candidates, set thời gian. Chuyển ngay sang ACTIVE trong cùng transaction vì `votingStart = block.timestamp`. |
| **ACTIVE** | `block.timestamp >= votingEnd` | **FINISHED** | Chuyển trạng thái tự động (implicit), không cần giao dịch riêng. |
| **ACTIVE** | Voter gọi `vote()` | **ACTIVE** (giữ nguyên) | Cập nhật `voteCount` và `voters[]`. |
| **ACTIVE** | Owner gọi `addCandidate()` | **ACTIVE** (giữ nguyên) | Thêm ứng cử viên mới. |
| **FINISHED** | Voter gọi `vote()` | **FINISHED** (revert) | Giao dịch bị từ chối: `"Voting is closed."` |
| **FINISHED** | Bất kỳ ai gọi `getAllVotesOfCandiates()` | **FINISHED** (giữ nguyên) | Trả về kết quả cuối cùng (view, miễn phí). |

#### 2.2.2. Đặc điểm quan trọng của State Machine

**1. Chuyển trạng thái ngầm (Implicit Transition):**
- Hợp đồng **không** lưu biến `state` (enum) riêng biệt. Trạng thái được **suy ra (derived)** từ so sánh `block.timestamp` với `votingStart` và `votingEnd`.
- Ưu điểm: Tiết kiệm Gas (không cần giao dịch để chuyển trạng thái). Hạn chế: Không có event phát ra khi chuyển trạng thái.

**2. Tính bất khả đảo ngược (Irreversible):**
- Luồng chỉ đi một chiều: `INITIALIZED → ACTIVE → FINISHED`.
- Không có cơ chế để quay lại trạng thái trước hoặc kéo dài thời gian bỏ phiếu.
- Muốn tổ chức phiên bỏ phiếu mới → phải deploy contract mới.

**3. Ranh giới trạng thái bằng thời gian (Time-based Boundaries):**
```
Timeline:
─────────|═══════════════════════════|─────────────────▶ t
     votingStart                votingEnd
         │       ACTIVE              │    FINISHED
         │   (vote() cho phép)       │  (vote() revert)
```

#### 2.2.3. So sánh: Implicit State vs Explicit State

| Tiêu chí | Implicit (Hiện tại) | Explicit (Dùng enum) |
|----------|--------------------|--------------------|
| **Cách hoạt động** | So sánh `block.timestamp` mỗi lần gọi | Lưu biến `State currentState` |
| **Chi phí Gas** | Không tốn Gas chuyển trạng thái | Tốn ~5,000 Gas mỗi lần SSTORE |
| **Linh hoạt** | Không thể tạm dừng/mở lại | Có thể thêm trạng thái PAUSED, CANCELLED |
| **Phù hợp** | Hệ thống đơn giản, time-based | Hệ thống phức tạp, cần kiểm soát manual |

> **Kết luận:** Kiến trúc Implicit State hiện tại là **phù hợp** cho quy mô dự án này. Nếu tương lai cần thêm các trạng thái như `PAUSED`, `CANCELLED`, hoặc cho phép Owner kéo dài thời gian bỏ phiếu, nên chuyển sang Explicit State với `enum`.

---

## Phần 3: Thiết lập môi trường với Hardhat

### 3.1. Khởi tạo dự án

#### 3.1.1. Quy trình khởi tạo ban đầu

Dự án được khởi tạo bằng lệnh Hardhat kết hợp với React (Create React App). Các bước thực hiện:

```bash
# Bước 1: Tạo dự án React
npx create-react-app react-voting-app
cd react-voting-app

# Bước 2: Khởi tạo Hardhat trong cùng thư mục
npx hardhat init
# → Chọn "Create a TypeScript project"
# → Chấp nhận cài đặt mặc định

# Bước 3: Cài đặt dependencies cần thiết
npm install ethers @openzeppelin/contracts dotenv
npm install --save-dev @nomicfoundation/hardhat-toolbox typescript ts-node
```

> **Lưu ý:** Dự án này tích hợp Hardhat **trực tiếp vào thư mục React** thay vì tách thành 2 repo riêng biệt (monorepo). Điều này đơn giản hóa quản lý nhưng cần cấu hình `tsconfig.json` cẩn thận để tránh xung đột giữa React (JSX) và Hardhat (CommonJS).

#### 3.1.2. Phiên bản các công cụ chính

| Công cụ | Phiên bản | Vai trò |
|---------|-----------|---------|
| **Hardhat** | `^2.22.2` | Framework phát triển Smart Contract |
| **Solidity** | `0.8.24` | Ngôn ngữ viết Smart Contract |
| **Ethers.js** | `^6.16.0` | Thư viện tương tác Blockchain (Frontend + Test) |
| **TypeScript** | `^6.0.3` | Ngôn ngữ cho test, config, và deploy scripts |
| **OpenZeppelin** | `^5.6.1` | Thư viện bảo mật chuẩn công nghiệp |
| **React** | `^18.2.0` | Framework Frontend |
| **Hardhat Ignition** | `^0.15.16` | Module triển khai hợp đồng (thay thế deploy scripts cũ) |

---

### 3.2. Cấu trúc thư mục (Directory Structure)

```
React-Voting-Application/
│
├── contracts/                    # 📁 Mã nguồn Solidity
│   └── Voting.sol                #    Hợp đồng thông minh chính
│
├── test/                         # 📁 Kịch bản kiểm thử
│   └── Voting.ts                 #    Unit tests (TypeScript + Mocha + Chai)
│
├── ignition/                     # 📁 Hardhat Ignition
│   └── modules/                  #    Các module triển khai
│       └── Voting.ts             #    Module deploy hợp đồng Voting
│
├── artifacts/                    # 📁 (Auto-generated) ABI & bytecode sau compile
│   └── contracts/
│       └── Voting.sol/
│           ├── Voting.json       #    ABI đầy đủ
│           └── Voting.dbg.json   #    Debug info
│
├── cache/                        # 📁 (Auto-generated) Cache biên dịch Hardhat
│
├── typechain-types/              # 📁 (Auto-generated) TypeScript types cho contract
│
├── src/                          # 📁 Mã nguồn Frontend (React)
│   ├── App.js                    #    Component chính, chứa logic tương tác contract
│   ├── App.css                   #    Stylesheet
│   ├── Components/               #    Các React components
│   │   ├── Login.jsx             #    Màn hình kết nối Metamask
│   │   ├── Connected.jsx         #    Màn hình bỏ phiếu (khi đã kết nối)
│   │   └── Finished.jsx          #    Màn hình kết thúc bỏ phiếu
│   └── Constant/
│       └── constant.js           #    ABI + địa chỉ Contract
│
├── public/                       # 📁 Tài nguyên tĩnh React
│
├── hardhat.config.ts             # ⚙️  Cấu hình Hardhat (networks, compiler)
├── tsconfig.json                 # ⚙️  Cấu hình TypeScript
├── package.json                  # ⚙️  Dependencies & scripts
├── .env                          # 🔒 Biến môi trường (PRIVATE_KEY, API_URL, ...)
└── .gitignore                    # 🚫 Loại trừ node_modules, .env, artifacts, cache
```

#### 3.2.1. Thư mục `contracts/` — Mã nguồn Solidity

**Mục đích:** Chứa toàn bộ mã nguồn Smart Contract viết bằng Solidity.

**File hiện tại:** `Voting.sol` (62 dòng, 1952 bytes)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public voters;
    uint256 public votingStart;
    uint256 public votingEnd;

    constructor(string[] memory _candidateNames, uint256 _durationInMinutes)
        Ownable(msg.sender) { ... }

    function addCandidate(string memory _name) public onlyOwner { ... }
    function vote(uint256 _candidateIndex) public { ... }
    function getAllVotesOfCandiates() public view returns (Candidate[] memory) { ... }
    function getVotingStatus() public view returns (bool) { ... }
    function getRemainingTime() public view returns (uint256) { ... }
}
```

**Quy ước quan trọng:**
- Sử dụng `pragma solidity ^0.8.20` — tương thích với compiler `0.8.24` trong config.
- License header `SPDX-License-Identifier: MIT` bắt buộc theo chuẩn Solidity.
- Import OpenZeppelin qua đường dẫn npm: `@openzeppelin/contracts/access/Ownable.sol`.

---

#### 3.2.2. Thư mục `test/` — Kịch bản kiểm thử

**Mục đích:** Chứa Unit Tests — **vô cùng quan trọng** trong phát triển Blockchain vì Smart Contract sau khi deploy là **bất biến (immutable)**, không thể sửa lỗi bằng hotfix.

**File hiện tại:** `Voting.ts` (122 dòng, 4855 bytes)

**Công nghệ sử dụng:**

| Thư viện | Vai trò |
|----------|---------|
| **Mocha** | Test runner — tổ chức test thành `describe` / `it` blocks |
| **Chai** | Assertion library — `expect(...).to.equal(...)` |
| **Hardhat Chai Matchers** | Mở rộng Chai cho Ethereum (`revertedWith`, `changeEtherBalance`) |
| **Hardhat Network Helpers** | Thao tác thời gian (`time.increase`), snapshot, fixture (`loadFixture`) |
| **Ethers.js v6** | Tương tác contract trong test (`getSigners`, `getContractFactory`) |

**Cấu trúc test hiện tại:**

```
Voting Contract
├── Deployment (3 tests)
│   ├── Should set the right owner
│   ├── Should initialize candidates correctly
│   └── Should set correct voting start and end times
│
├── Voting Process (4 tests)
│   ├── Should allow a voter to vote for a valid candidate
│   ├── Should revert if voter tries to vote twice
│   ├── Should revert if invalid candidate index is provided
│   └── Should revert if voting is closed
│
├── Admin Functions (2 tests)
│   ├── Should allow owner to add candidate
│   └── Should revert if non-owner tries to add candidate
│
└── Status & Remaining Time (2 tests)
    ├── Should return correct status
    └── Should return remaining time properly
```

**Tổng cộng: 11 test cases** bao phủ các kịch bản chính và edge cases.

---

#### 3.2.3. Thư mục `ignition/modules/` — Mã triển khai (Deploy)

**Mục đích:** Chứa các module triển khai sử dụng **Hardhat Ignition** — hệ thống deploy thế hệ mới thay thế cho deploy scripts truyền thống.

**File hiện tại:** `Voting.ts` (13 dòng, 363 bytes)

```typescript
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingModule = buildModule("VotingModule", (m) => {
  const candidateNames = ["Khai", "Kiet", "Nam", "Linh", "Loan"];
  const durationInMinutes = 10;

  const voting = m.contract("Voting", [candidateNames, durationInMinutes]);

  return { voting };
});

export default VotingModule;
```

**So sánh Hardhat Ignition vs Deploy Scripts truyền thống:**

| Tiêu chí | Hardhat Ignition (Hiện tại) | Deploy Scripts (Cũ) |
|----------|----------------------------|---------------------|
| **Cú pháp** | Khai báo (declarative) — mô tả *cái gì* cần deploy | Mệnh lệnh (imperative) — viết *cách* deploy từng bước |
| **Idempotent** | ✅ Tự động bỏ qua contract đã deploy | ❌ Chạy lại = deploy trùng |
| **Quản lý state** | Tự động lưu deployment state vào `ignition/deployments/` | Phải tự quản lý |
| **Retry** | ✅ Tự động retry khi transaction fail | ❌ Phải xử lý thủ công |
| **Multi-contract** | Tự động resolve dependency graph | Phải sắp xếp thứ tự thủ công |

---

### 3.3. Cấu hình Hardhat (`hardhat.config.ts`)

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const { API_URL, PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {},          // Mạng giả lập cục bộ (mặc định)
    sepolia: {            // Mạng thử nghiệm Ethereum
      url: API_URL || "",
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    }
  },
};

export default config;
```

**Giải thích chi tiết cấu hình:**

| Thuộc tính | Giá trị | Mô tả |
|------------|---------|-------|
| `solidity` | `"0.8.24"` | Phiên bản compiler Solidity. Tương thích với `pragma ^0.8.20` trong contract. |
| `networks.hardhat` | `{}` | Mạng giả lập local — Hardhat tự tạo 20 tài khoản test, mỗi tài khoản 10,000 ETH. Dùng cho unit test và dev nhanh. |
| `networks.sepolia` | `{ url, accounts }` | Mạng testnet Ethereum Sepolia. `url` = RPC endpoint (từ Alchemy/Infura). `accounts` = mảng private keys cho deploy. |

**Biến môi trường (`.env`):**

```env
API_URL=https://eth-sepolia.g.alchemy.com/v2/...    # RPC endpoint Alchemy
PRIVATE_KEY=...                                       # Private key (KHÔNG có prefix 0x)
REACT_APP_CONTRACT_ADDRESS=0x27B1C83e...              # Địa chỉ contract đã deploy
```

> ⚠️ **CẢNH BÁO BẢO MẬT:** File `.env` **TUYỆT ĐỐI không được commit** lên Git. Đã được liệt kê trong `.gitignore`. Private key bị lộ = mất toàn bộ tài sản trong ví.

---

### 3.4. Cấu hình TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["./scripts", "./test", "./typechain-types", "./ignition", "./hardhat.config.ts"]
}
```

**Lưu ý:** File `tsconfig.json` này **chỉ áp dụng cho Hardhat** (test, scripts, ignition). Frontend React sử dụng cấu hình TypeScript riêng được quản lý bởi `react-scripts`.

| Thuộc tính | Mục đích |
|------------|----------|
| `target: "es2020"` | Hỗ trợ `BigInt` (cần thiết cho Ethers.js v6 — dùng `bigint` thay vì `BigNumber`) |
| `module: "commonjs"` | Tương thích với Hardhat runtime (Node.js) |
| `strict: true` | Bật kiểm tra kiểu nghiêm ngặt |
| `include` | Chỉ compile các thư mục liên quan đến Hardhat, bỏ qua `src/` (React) |

---

### 3.5. Các lệnh Hardhat thường dùng

| Lệnh | Mục đích |
|-------|----------|
| `npx hardhat compile` | Biên dịch Solidity → ABI + Bytecode (lưu vào `artifacts/`) |
| `npx hardhat test` | Chạy toàn bộ Unit Tests |
| `npx hardhat node` | Khởi chạy local Ethereum node (JSON-RPC tại `localhost:8545`) |
| `npx hardhat ignition deploy ./ignition/modules/Voting.ts --network localhost` | Deploy lên mạng local |
| `npx hardhat ignition deploy ./ignition/modules/Voting.ts --network sepolia` | Deploy lên Sepolia testnet |
| `npx hardhat clean` | Xóa `artifacts/` và `cache/` (khi gặp lỗi compile) |
| `npx hardhat console --network localhost` | Mở REPL tương tác với contract |

---

## Phần 4: Code & Test (Implementation Phase)

### 4.1. Viết Code — Sử dụng thư viện chuẩn OpenZeppelin

#### 4.1.1. Tại sao sử dụng OpenZeppelin?

OpenZeppelin là thư viện Smart Contract **được audit bảo mật bởi các tổ chức hàng đầu** và được sử dụng rộng rãi nhất trong hệ sinh thái Ethereum. Dự án sử dụng **OpenZeppelin v5.6.1**.

| Tiêu chí | Tự viết code | Sử dụng OpenZeppelin |
|----------|-------------|---------------------|
| **Bảo mật** | Rủi ro cao — dễ mắc lỗi bảo mật | ✅ Đã được audit chuyên nghiệp |
| **Tốn Gas** | Có thể không tối ưu | ✅ Tối ưu Gas (custom errors trong v5) |
| **Thời gian** | Phải viết & test từ đầu | ✅ Sẵn sàng sử dụng |
| **Cộng đồng** | Không ai review | ✅ Hàng ngàn developer đã review |

#### 4.1.2. Thư viện OpenZeppelin đã sử dụng trong dự án

**① `Ownable` — Kiểm soát quyền truy cập (Access Control)**

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    // OpenZeppelin v5: Phải truyền initialOwner vào constructor
    constructor(...) Ownable(msg.sender) { ... }

    // Modifier onlyOwner — chỉ owner mới gọi được
    function addCandidate(string memory _name) public onlyOwner { ... }
}
```

**Cơ chế hoạt động của `Ownable` v5:**

| Thành phần | Mô tả |
|------------|-------|
| `_owner` (private) | Biến lưu địa chỉ owner, kế thừa từ `Ownable` |
| `onlyOwner` (modifier) | Kiểm tra `msg.sender == _owner`, nếu sai → revert với `OwnableUnauthorizedAccount(msg.sender)` |
| `transferOwnership(address)` | Cho phép owner hiện tại chuyển quyền cho địa chỉ khác |
| `renounceOwnership()` | Owner từ bỏ quyền — contract trở thành "vô chủ" (không ai có quyền admin) |
| Custom Error (v5) | `OwnableUnauthorizedAccount(address)` — tiết kiệm Gas hơn so với `require("message")` ở v4 |

**② Các thư viện OpenZeppelin khác có thể tích hợp (Tham khảo mở rộng):**

| Thư viện | Mục đích | Khi nào cần |
|----------|----------|-------------|
| `ReentrancyGuard` | Chống tấn công reentrancy | Khi contract có chuyển ETH/token |
| `Pausable` | Tạm dừng contract khẩn cấp | Khi cần cơ chế "kill switch" |
| `ERC20` | Token tiêu chuẩn fungible | Nếu token hóa phiếu bầu |
| `ERC721` | NFT tiêu chuẩn | Nếu mỗi phiếu bầu là NFT duy nhất |
| `AccessControl` | Quản lý nhiều role (admin, moderator) | Khi cần phân quyền phức tạp hơn Ownable |

> **Lưu ý:** Dự án hiện tại **chỉ sử dụng `Ownable`** vì không có chuyển tài sản (ETH/token) nên không cần `ReentrancyGuard`, và quy mô nhỏ nên `Ownable` đủ dùng thay vì `AccessControl`.

#### 4.1.3. Phân tích code Smart Contract theo từng hàm

**Hàm `constructor` — Khởi tạo hợp đồng:**

```solidity
constructor(string[] memory _candidateNames, uint256 _durationInMinutes)
    Ownable(msg.sender)
{
    for (uint256 i = 0; i < _candidateNames.length; i++) {
        candidates.push(Candidate({
            name: _candidateNames[i],
            voteCount: 0
        }));
    }
    votingStart = block.timestamp;
    votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
}
```

| Dòng | Giải thích |
|------|-----------|
| `string[] memory _candidateNames` | Mảng tên ứng cử viên, `memory` = không lưu vĩnh viễn, chỉ tồn tại trong transaction |
| `Ownable(msg.sender)` | Gọi constructor cha, đặt `msg.sender` làm owner |
| `candidates.push(...)` | Thêm từng ứng cử viên vào mảng storage (tốn ~20,000 Gas/lần) |
| `block.timestamp` | Thời điểm block hiện tại (Unix timestamp, đơn vị giây) |
| `1 minutes` | Hằng số Solidity = 60 giây |

**Hàm `vote` — Logic bỏ phiếu cốt lõi:**

```solidity
function vote(uint256 _candidateIndex) public {
    require(!voters[msg.sender], "You have already voted.");      // Check 1
    require(_candidateIndex < candidates.length, "Invalid candidate index.");  // Check 2
    require(block.timestamp >= votingStart && block.timestamp < votingEnd, "Voting is closed.");  // Check 3

    candidates[_candidateIndex].voteCount++;  // Effect 1
    voters[msg.sender] = true;                // Effect 2
}
```

**Tuân thủ mô hình Checks-Effects-Interactions (CEI):**

| Giai đoạn | Code | Mô tả |
|-----------|------|-------|
| **Checks** | 3 lệnh `require` | Kiểm tra điều kiện TRƯỚC khi thay đổi state |
| **Effects** | `voteCount++`, `voters = true` | Cập nhật state SAU khi check |
| **Interactions** | (Không có) | Không gọi external contract → An toàn trước reentrancy |

**Hàm `addCandidate` — Thêm ứng cử viên (chỉ Owner):**

```solidity
function addCandidate(string memory _name) public onlyOwner {
    candidates.push(Candidate({ name: _name, voteCount: 0 }));
}
```

| Bảo mật | Chi tiết |
|---------|----------|
| `onlyOwner` | Modifier từ OpenZeppelin — tự động revert nếu `msg.sender != owner` |
| Không giới hạn thời gian | Owner có thể thêm ứng cử viên ngay cả khi bỏ phiếu đã kết thúc |

**Các hàm View — Truy vấn miễn phí Gas:**

```solidity
function getAllVotesOfCandiates() public view returns (Candidate[] memory) {
    return candidates;  // Trả về toàn bộ mảng — cẩn thận với mảng lớn
}

function getVotingStatus() public view returns (bool) {
    return (block.timestamp >= votingStart && block.timestamp < votingEnd);
}

function getRemainingTime() public view returns (uint256) {
    require(block.timestamp >= votingStart, "Voting has not started yet.");
    if (block.timestamp >= votingEnd) { return 0; }
    return votingEnd - block.timestamp;  // Trả về số giây còn lại
}
```

---

### 4.2. Unit Test — Kiểm thử từng hàm

#### 4.2.1. Chiến lược kiểm thử

Dự án áp dụng chiến lược **"Happy Path + Sad Path"** cho mỗi hàm:

| Loại test | Mô tả | Ví dụ |
|-----------|-------|-------|
| **Happy Path** | Hàm hoạt động đúng khi input hợp lệ | Voter bỏ phiếu thành công |
| **Sad Path** | Hàm revert đúng khi input không hợp lệ | Voter bỏ phiếu 2 lần → revert |
| **Edge Case** | Trường hợp biên, giá trị ranh giới | Bỏ phiếu ngay trước/sau thời điểm kết thúc |

#### 4.2.2. Fixture Pattern — Tái sử dụng trạng thái test

```typescript
async function deployVotingFixture() {
    const [owner, voter1, voter2, otherAccount] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidateNames, durationInMinutes);
    return { voting, owner, voter1, voter2, otherAccount };
}
```

**Cơ chế `loadFixture`:** Snapshot blockchain state → mỗi test bắt đầu từ trạng thái sạch (clean state). Nhanh hơn deploy lại contract mỗi test.

#### 4.2.3. Phân tích chi tiết từng nhóm Test

**Nhóm 1: Deployment Tests (3 tests)**

```typescript
describe("Deployment", function () {
    it("Should set the right owner", async function () {
        const { voting, owner } = await loadFixture(deployVotingFixture);
        expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should initialize candidates correctly", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        const candidates = await voting.getAllVotesOfCandiates();
        expect(candidates.length).to.equal(3);
        expect(candidates[0].name).to.equal("Alice");
        expect(candidates[0].voteCount).to.equal(0n);  // BigInt literal
    });

    it("Should set correct voting start and end times", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        const start = await voting.votingStart();
        const end = await voting.votingEnd();
        expect(end - start).to.equal(BigInt(durationInMinutes * 60));
    });
});
```

| Test | Kiểm tra | Loại |
|------|----------|------|
| Right owner | `voting.owner() == deployer` | Happy Path |
| Candidates init | Đúng 3 ứng cử viên, tên đúng, voteCount = 0 | Happy Path |
| Time range | `votingEnd - votingStart == duration * 60` | Happy Path |

**Nhóm 2: Voting Process Tests (4 tests)**

```typescript
describe("Voting Process", function () {
    it("Should allow a voter to vote for a valid candidate", async function () {
        const { voting, voter1 } = await loadFixture(deployVotingFixture);
        await voting.connect(voter1).vote(0);
        const candidates = await voting.getAllVotesOfCandiates();
        expect(candidates[0].voteCount).to.equal(1n);
        expect(await voting.voters(voter1.address)).to.be.true;
    });

    it("Should revert if voter tries to vote twice", async function () {
        // ... vote 1 lần → vote lần 2 → expect revert "You have already voted."
    });

    it("Should revert if invalid candidate index", async function () {
        // ... vote(5) với chỉ 3 ứng cử viên → expect revert "Invalid candidate index."
    });

    it("Should revert if voting is closed", async function () {
        // ... time.increase(duration + 1) → vote → expect revert "Voting is closed."
    });
});
```

| Test | Kiểm tra | Loại |
|------|----------|------|
| Vote thành công | `voteCount++`, `voters[addr] = true` | Happy Path |
| Vote 2 lần | Revert với message đúng | Sad Path |
| Index sai | Revert khi index >= candidates.length | Edge Case |
| Hết giờ | Dùng `time.increase` để tua thời gian | Edge Case |

**Nhóm 3: Admin Functions Tests (2 tests)**

```typescript
describe("Admin Functions", function () {
    it("Should allow owner to add candidate", async function () {
        const { voting, owner } = await loadFixture(deployVotingFixture);
        await voting.connect(owner).addCandidate("Dave");
        const candidates = await voting.getAllVotesOfCandiates();
        expect(candidates.length).to.equal(4);
        expect(candidates[3].name).to.equal("Dave");
    });

    it("Should revert if non-owner tries to add candidate", async function () {
        // ... voter1 gọi addCandidate → expect revert "OwnableUnauthorizedAccount"
    });
});
```

| Test | Kiểm tra | Loại |
|------|----------|------|
| Owner thêm ứng cử viên | `candidates.length` tăng, tên đúng | Happy Path |
| Non-owner bị chặn | OpenZeppelin custom error | Sad Path / Bảo mật |

**Nhóm 4: Status & Remaining Time Tests (2 tests)**

```typescript
describe("Status & Remaining Time", function () {
    it("Should return correct status", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        expect(await voting.getVotingStatus()).to.be.true;    // Đang mở

        await time.increase(durationInMinutes * 60 + 1);       // Tua thời gian
        expect(await voting.getVotingStatus()).to.be.false;   // Đã đóng
    });

    it("Should return remaining time properly", async function () {
        const { voting } = await loadFixture(deployVotingFixture);
        const remainingTime = await voting.getRemainingTime();
        expect(remainingTime > 0n).to.be.true;                // Còn thời gian

        await time.increase(durationInMinutes * 60 + 1);
        expect(await voting.getRemainingTime()).to.equal(0n);  // Hết giờ → 0
    });
});
```

| Test | Kiểm tra | Loại |
|------|----------|------|
| Status đúng | `true` khi đang mở, `false` khi đóng | Happy Path + Edge |
| Remaining time | `> 0` khi đang mở, `== 0` khi hết giờ | Happy Path + Edge |

#### 4.2.4. Kỹ thuật kiểm thử đặc biệt trong Blockchain

| Kỹ thuật | Công cụ | Mô tả |
|----------|---------|-------|
| **Time manipulation** | `time.increase(seconds)` | Tua nhanh thời gian trên Hardhat Network — bắt buộc để test logic time-based |
| **Multi-account testing** | `ethers.getSigners()` | Lấy nhiều tài khoản test (owner, voter1, voter2...) để mô phỏng nhiều người dùng |
| **Fixture snapshots** | `loadFixture()` | Chụp snapshot blockchain → restore nhanh cho mỗi test (không deploy lại) |
| **BigInt assertions** | `0n`, `1n`, `BigInt()` | Ethers.js v6 dùng native `bigint` thay vì `BigNumber` — cần dùng `0n` thay vì `0` |

#### 4.2.5. Chạy Unit Test

```bash
# Chạy toàn bộ test
npx hardhat test

# Kết quả mong đợi:
#   Voting Contract
#     Deployment
#       ✔ Should set the right owner
#       ✔ Should initialize candidates correctly
#       ✔ Should set correct voting start and end times
#     Voting Process
#       ✔ Should allow a voter to vote for a valid candidate
#       ✔ Should revert if voter tries to vote twice
#       ✔ Should revert if invalid candidate index is provided
#       ✔ Should revert if voting is closed
#     Admin Functions
#       ✔ Should allow owner to add candidate
#       ✔ Should revert if non-owner tries to add candidate
#     Status & Remaining Time
#       ✔ Should return correct status
#       ✔ Should return remaining time properly
#
#   11 passing
```

---

### 4.3. Local Node — Giả lập môi trường mạng thật

#### 4.3.1. Khởi chạy Hardhat Node

```bash
# Terminal 1: Khởi chạy node cục bộ
npx hardhat node
```

**Kết quả:** Hardhat tạo một Ethereum node giả lập tại `http://127.0.0.1:8545/` với:

| Đặc điểm | Giá trị |
|-----------|---------|
| **Số tài khoản** | 20 tài khoản được tạo sẵn |
| **Số dư mỗi tài khoản** | 10,000 ETH (test) |
| **Chain ID** | 31337 |
| **Block time** | Tự động mine khi có transaction |
| **Console log** | Hiển thị mọi transaction, event, revert |

#### 4.3.2. Deploy lên Local Node

```bash
# Terminal 2: Deploy contract
npx hardhat ignition deploy ./ignition/modules/Voting.ts --network localhost
```

**Kết quả mong đợi:**
```
Deploying [ VotingModule ]

Batch #1
  Executed VotingModule#Voting

[ VotingModule ] successfully deployed 🚀

Deployed Addresses

VotingModule#Voting - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

#### 4.3.3. Kết nối Frontend với Local Node

Sau khi deploy lên local, cần cấu hình để Frontend kết nối:

**Bước 1:** Cập nhật file `.env`:
```env
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Bước 2:** Cấu hình Metamask:
| Thuộc tính | Giá trị |
|------------|---------|
| Network Name | Hardhat Localhost |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | ETH |

**Bước 3:** Import tài khoản test vào Metamask bằng private key hiển thị khi chạy `npx hardhat node`.

**Bước 4:** Khởi chạy Frontend:
```bash
npm start
```

---

### 4.4. Testnet — Triển khai trên mạng thử nghiệm công khai

#### 4.4.1. Mạng Sepolia Testnet

Dự án đã được cấu hình để deploy lên **Sepolia** — testnet chính thức của Ethereum.

**Yêu cầu trước khi deploy:**

| Yêu cầu | Mô tả | Cách lấy |
|----------|-------|----------|
| **RPC URL** | Endpoint kết nối Sepolia | Đăng ký tại [Alchemy](https://www.alchemy.com/) hoặc [Infura](https://infura.io/) |
| **Private Key** | Khóa riêng của ví deploy | Export từ Metamask (Settings → Security) |
| **Sepolia ETH** | ETH test để trả Gas | Faucet: [sepoliafaucet.com](https://sepoliafaucet.com/) |

#### 4.4.2. Quy trình deploy lên Testnet

**Bước 1:** Cấu hình `.env`:
```env
API_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
PRIVATE_KEY=your-private-key-without-0x-prefix
```

**Bước 2:** Deploy:
```bash
npx hardhat ignition deploy ./ignition/modules/Voting.ts --network sepolia
```

**Bước 3:** Xác minh contract (tùy chọn):
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

#### 4.4.3. So sánh Local Node vs Testnet vs Mainnet

| Tiêu chí | Hardhat Node (Local) | Sepolia (Testnet) | Ethereum Mainnet |
|----------|---------------------|-------------------|-----------------|
| **Chi phí** | Miễn phí | Miễn phí (dùng ETH test) | Tốn ETH thật |
| **Tốc độ** | Tức thì | ~15 giây/block | ~12 giây/block |
| **Persistence** | Mất khi tắt node | Vĩnh viễn trên chain | Vĩnh viễn trên chain |
| **Phù hợp** | Dev & Unit Test | Integration Test & Demo | Production |
| **Block Explorer** | Không có | [sepolia.etherscan.io](https://sepolia.etherscan.io/) | [etherscan.io](https://etherscan.io/) |

#### 4.4.4. Contract đã deploy trên Sepolia

Dự án đã được triển khai thành công trên Sepolia Testnet:

| Thông tin | Giá trị |
|-----------|---------|
| **Địa chỉ Contract** | `0x27B1C83e8ebA410e30Bf5074D6ce684B0C058572` |
| **Mạng** | Sepolia Testnet |
| **Ứng cử viên** | Khai, Kiet, Nam, Linh, Loan |
| **Thời lượng bỏ phiếu** | 10 phút |
| **RPC Provider** | Alchemy |

> Có thể xem chi tiết tại: `https://sepolia.etherscan.io/address/0x27B1C83e8ebA410e30Bf5074D6ce684B0C058572`

---

### 4.5. Tổng kết quy trình phát triển (Development Workflow)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  1. Code │───▶│ 2. Test  │───▶│ 3. Local │───▶│4. Testnet│───▶│5. Mainnet│
│  Solidity│    │  Unit    │    │   Node   │    │ (Sepolia)│    │(Optional)│
│  + React │    │  Tests   │    │  Deploy  │    │  Deploy  │    │  Deploy  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │               │
  Viết code      npx hardhat     npx hardhat     npx hardhat     Khi đã
  .sol + .jsx      test            node          ignition       hoàn toàn
                                 + ignition      --network       sẵn sàng
                  11 tests        deploy         sepolia
                  passing         localhost
```

**Nguyên tắc quan trọng:**
1. **Test trước, deploy sau** — Không bao giờ deploy contract chưa được test kỹ.
2. **Local trước, Testnet sau** — Debug trên local (miễn phí, nhanh) trước khi deploy testnet.
3. **Testnet trước, Mainnet sau** — Chạy thử trên Sepolia để phát hiện lỗi integration.
4. **Không thể sửa sau deploy** — Smart Contract là immutable. Lỗi sau deploy = mất tiền thật.

---

