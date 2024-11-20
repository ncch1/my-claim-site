document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connectWallet');
    const connectionStatus = document.getElementById('connection-status');
    const claimButton = document.getElementById('claimButton');
    const statusElement = document.getElementById('status');

    // Проверяем, подключена ли библиотека ethers.js
    if (typeof ethers === 'undefined') {
        connectionStatus.textContent = 'Ошибка: библиотека ethers.js не подключена.';
        connectionStatus.style.color = 'red';
        return;
    }

    let provider, signer;

    // Функция подключения MetaMask
    async function connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                const userAddress = await signer.getAddress();
                connectionStatus.textContent = `Подключен: ${userAddress}`;
                connectionStatus.style.color = 'green';
            } else {
                connectionStatus.textContent = 'MetaMask не установлен или отключен.';
                connectionStatus.style.color = 'red';
            }
        } catch (error) {
            connectionStatus.textContent = `Ошибка подключения: ${error.message}`;
            connectionStatus.style.color = 'red';
        }
    }

    // Функция отправки запроса на клейм
    async function sendClaim() {
        const amountElement = document.getElementById('amount');
        const amount = amountElement.value;

        if (!amount || amount <= 0) {
            statusElement.textContent = 'Введите корректную сумму.';
            statusElement.style.color = 'red';
            return;
        }

        try {
            const userAddress = await signer.getAddress();
            const amountWei = ethers.utils.parseEther(amount);
            const messageHash = ethers.utils.solidityKeccak256(
                ['uint256', 'address'],
                [amountWei.toString(), userAddress]
            );
            const messageHashBytes = ethers.utils.arrayify(messageHash);
            const signature = await signer.signMessage(messageHashBytes);

            // Отправка данных на сервер
            const response = await fetch('https://5c51-193-233-165-83.ngrok-free.app/claim', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amountWei: amountWei.toString(),
                    signature: signature,
                }),
            });

            statusElement.textContent = 'Запрос отправлен.';
            statusElement.style.color = 'green';
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            statusElement.textContent = `Ошибка: ${error.message}`;
            statusElement.style.color = 'red';
        }
    }

    connectWalletButton.addEventListener('click', connectWallet);
    claimButton.addEventListener('click', sendClaim);
});
