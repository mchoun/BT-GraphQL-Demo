(async () => {
  const button = document.querySelector('#submit-button');
  const responseMessage = document.querySelector('#response-message');
  const nonceMessage = document.querySelector('#nonce-message');
  const clearButton = document.querySelector('#clear-data');

  let clientToken = await fetch('/api/client-token')
    .then((response) => response.text())
    .catch((error) => console.error(error));

  let braintreeClient = braintree.dropin.create({
    authorization: clientToken,
    container: '#dropin-container',
  });

  braintreeClient.then((dropinInstance) => {
    button.addEventListener('click', () => {
      dropinInstance
        .requestPaymentMethod()
        .then(function (payload) {
          // When the user clicks on the 'Submit payment' button this code will send the
          // encrypted payment information in a variable called a payment method nonce

          nonceMessage.textContent = JSON.stringify(payload.nonce);

          fetch('/api/checkout', {
            method: 'POST',
            body: JSON.stringify({ paymentMethodNonce: payload.nonce }),
            headers: { 'Content-Type': 'application/json' },
          })
            .then((res) => res.json())
            .then((response) => {
              responseMessage.textContent = JSON.stringify(response);
            });
        })
        .catch((err) => console.error(err));
    });
  });

  clearButton.addEventListener('click', () => {
    braintreeClient.then((dropinInstance) => {
      dropinInstance.clearSelectedPaymentMethod();
    });
    responseMessage.textContent = null;
    nonceMessage.textContent = null;
  });
})();
