document.getElementById('claimButton').addEventListener('click', async () => {
    const status = document.getElementById('status');
    status.textContent = '';

    // Проверяем, доступен ли MetaMask
    if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
        // Создаем провайдера
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []); // Запрашиваем доступ к аккаунту

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
        const contractAddress = 'ВАШ_АДРЕС_КОНТРАКТА';

        // Генерируем хэш сообщения
        const messageHash = ethers.utils.solidityKeccak256(
            ['uint256', 'address'],
            [amountWei.toString(), contractAddress]
        );
        const messageHashBytes = ethers.utils.arrayify(messageHash);

        try {
            // Подписываем сообщение
            const signature = await signer.signMessage(messageHashBytes);

            // Здесь вы можете отправить данные на сервер или релэйеру
            // Для примера выводим информацию на страницу
            status.textContent = 'Подпись создана. Отправьте следующую информацию релэйеру:';
            status.textContent += `\n\nСумма (wei): ${amountWei.toString()}`;
            status.textContent += `\nПодпись: ${signature}`;
        } catch (error) {
            console.error(error);
            status.textContent = 'Ошибка при подписании сообщения: ' + error.message;
        }
    } else {
        status.textContent = 'Пожалуйста, установите MetaMask или используйте поддерживаемый браузер.';
    }
});
