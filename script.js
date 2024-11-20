document.addEventListener('DOMContentLoaded', () => {
    const connectWalletButton = document.getElementById('connectWallet');
    const claimButton = document.getElementById('claimButton');
    const claimSection = document.getElementById('claim-section');
    const statusElement = document.getElementById('status');
    const connectionStatus = document.getElementById('connection-status');

    // Адрес вашего контракта
    const contractAddress = '0xa0e2d4b6a8ff992d2ecfc51d138760703c739d40';

    // Убедитесь, что ваш релэйер запущен на правильном сервере
    const relayServerUrl = 'http://localhost:3000/claim';

    // Функция подключения к MetaMask
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Запрашиваем доступ к аккаунтам MetaMask
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                const userAddress = await signer.getAddress();
                connectionStatus.textContent = `Подключен: ${userAddress}`;
                connectionStatus.style.color = 'green';
                claimSection.classList.remove('hidden');
            } catch (error) {
                connectionStatus.textContent = `Ошибка подключения: ${error.message}`;
                connectionStatus.style.color = 'red';
            }
        } else {
            connectionStatus.textContent = 'MetaMask не установлен. Установите MetaMask и обновите страницу.';
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

        statusElement.textContent = 'Подписываем сообщение...';

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const userAddress = await signer.getAddress();
            const amountWei = ethers.utils.parseEther(amount);

            // Генерация хэша сообщения
            const messageHash = ethers.utils.solidityKeccak256(
                ['uint256', 'address'],
                [amountWei.toString(), contractAddress]
            );
            const messageHashBytes = ethers.utils.arrayify(messageHash);

            // Подписание сообщения
            const signature = await signer.signMessage(messageHashBytes);

            statusElement.textContent = 'Отправляем запрос на сервер...';

            // Отправка данных на сервер
            const response = await fetch(relayServerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amountWei: amountWei.toString(),
                    signature: signature
                })
            });

            const result = await response.json();

            if (result.success) {
                statusElement.textContent = `Транзакция успешно отправлена! TxHash: ${result.txHash}`;
                statusElement.style.color = 'green';
            } else {
                statusElement.textContent = `Ошибка: ${result.message}`;
                statusElement.style.color = 'red';
            }
        } catch (error) {
            statusElement.textContent = `Ошибка: ${error.message}`;
            statusElement.style.color = 'red';
        }
    }

    // Обработчики событий
    connectWalletButton.addEventListener('click', connectWallet);
    claimButton.addEventListener('click', sendClaim);
});
