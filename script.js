document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connectWallet');
    const connectionStatus = document.getElementById('connection-status');

    // Проверяем, подключена ли библиотека ethers.js
    if (typeof ethers === 'undefined') {
        connectionStatus.textContent = 'Ошибка: библиотека ethers.js не подключена.';
        connectionStatus.style.color = 'red';
        return;
    }

    // Функция подключения MetaMask
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
            try {
                // Запрашиваем доступ к аккаунтам MetaMask
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                const userAddress = await signer.getAddress();
                connectionStatus.textContent = `Подключен: ${userAddress}`;
                connectionStatus.style.color = 'green';
            } catch (error) {
                connectionStatus.textContent = `Ошибка подключения: ${error.message}`;
                connectionStatus.style.color = 'red';
            }
        } else {
            connectionStatus.textContent = 'MetaMask не установлен или отключен.';
            connectionStatus.style.color = 'red';
        }
    }

    connectWalletButton.addEventListener('click', connectWallet);
});
