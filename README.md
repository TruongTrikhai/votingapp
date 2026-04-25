# React Voting Application

Dự án này là một DApp (Decentralized Application) bầu cử toàn diện được xây dựng trên nền tảng **React**, **Hardhat v3**, **Ethers v6**, **TypeScript**, và sử dụng các tiêu chuẩn bảo mật của **OpenZeppelin**. Quá trình triển khai hợp đồng thông minh được thực hiện qua **Hardhat Ignition**.

## 1. Yêu cầu hệ thống (Prerequisites)

- Node.js >= 18.0.0 (Hardhat v3 yêu cầu Node 18 trở lên và môi trường ESM).

## 2. Cài đặt (Installation)

Sau khi clone dự án về máy, hãy cài đặt các thư viện cần thiết:

```shell
npm install
```

## 3. Kiểm thử (Testing)

Dự án bao gồm một bộ Unit Tests toàn diện (viết bằng TypeScript + Mocha + Chai) với độ bao phủ cao, kiểm tra tất cả các logic từ khởi tạo, cấp quyền (Ownable), cho đến kiểm soát thời gian bỏ phiếu.

Để chạy bộ kiểm thử:
```shell
npx hardhat test
```

## 4. Triển khai Smart Contract (Deployment)

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

**Cách triển khai một hợp đồng hoàn toàn mới (Redeploy)**

Nếu hợp đồng cũ của bạn đã hết hạn (Voting Finished) và bạn muốn khởi tạo lại từ đầu, hãy thêm cờ `--reset` vào lệnh deploy. Thao tác này sẽ xóa lịch sử deploy cũ và tạo ra một Contract Address mới tinh:

```shell
# Trên Localhost
npx hardhat ignition deploy ./ignition/modules/Voting.ts --network localhost --reset

# Trên Sepolia
npx hardhat ignition deploy ./ignition/modules/Voting.ts --network sepolia --reset
```

## 5. Chạy giao diện Frontend (React)

Sau khi hợp đồng thông minh được triển khai, hãy **sao chép địa chỉ hợp đồng (Contract Address)** hiển thị trên terminal.

1. Vào file hằng số (thường nằm ở `src/Constant/constant.js` hoặc file `.env` của React).
2. Dán địa chỉ hợp đồng mới vào biến `contractAddress`.
3. Lưu lại và khởi động giao diện React:

```shell
npm start
```

Ứng dụng sẽ tự động mở lên tại `http://localhost:3000`. Hãy đảm bảo ví Metamask của bạn đã được chuyển sang đúng mạng lưới mà bạn vừa deploy.

---