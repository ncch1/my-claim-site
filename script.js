// script.js

document.getElementById('claimButton').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = '';

    // Проверяем, доступен ли Ethereum-провайдер (MetaMask)
    if (typeof window.ethereum !== 'undefined') {
        // Создаем провайдера
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        try {
            // Запрашиваем доступ к аккаунту пользователя
            await provider.send('eth_requestAccounts', []);

            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();

            const amountInput = document.getElementById('amount');
            const amount = amountInput.value;

            if (!amount || amount <= 0) {
                status.textContent = 'Пожалуйста, введите корректную сумму.';
                return;
            }

            const amountWei = ethers.utils.parseEther(amount);

            // Адрес вашего контракта
            const contractAddress = '0xa0e2d4b6a8ff992d2ecfc51d138760703c739d40';

            // Генерируем хэш сообщения
            const messageHash = ethers.utils.solidityKeccak256(
                ['uint256', 'address'],
                [amountWei.toString(), contractAddress]
            );
            const messageHashBytes = ethers.utils.arrayify(messageHash);

            // Подписываем сообщение
            const signature = await signer.signMessage(messageHashBytes);

            // Отправляем данные на релэйер
            const response = await fetch('http://localhost:3000/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amountWei: amountWei.toString(),
                    signature: signature
                })
            });

            const result = await response.json();
            if (result.success) {
                status.textContent = 'Транзакция успешно отправлена релэйером!';
            } else {
                status.textContent = 'Ошибка релэйера: ' + result.message;
            }
        } catch (error) {
            console.error(error);
            status.textContent = 'Ошибка: ' + error.message;
        }
    } else {
        status.textContent = 'Пожалуйста, установите MetaMask или используйте поддерживаемый браузер.';
    }
});
