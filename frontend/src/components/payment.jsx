import React, { useState } from 'react';
import './styles.css';

const Payment = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [isFormValid, setIsFormValid] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber && expiryDate && cvv && nameOnCard && billingAddress) {
      setIsFormValid(true);
      setPaymentSuccess(true);
    } else {
      setIsFormValid(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h1>Payment Details</h1>
        <p>Complete your payment to proceed with the service.</p>
      </div>

      {paymentSuccess ? (
        <div className="payment-success">
          <h2>Payment Successful!</h2>
          <p>Your payment has been successfully processed. Thank you for your purchase.</p>
        </div>
      ) : (
        <>
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9876 5432"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nameOnCard">Name on Card</label>
              <input
                type="text"
                id="nameOnCard"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="month"
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
              />
            </div>

            <div className="form-group">
              <label htmlFor="billingAddress">Billing Address</label>
              <textarea
                id="billingAddress"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Enter your billing address"
              ></textarea>
            </div>

            {!isFormValid && (
              <div className="form-error">
                <p>Please fill in all the fields correctly.</p>
              </div>
            )}

            <button type="submit" className="btn-submit">Submit Payment</button>
          </form>

          <div className="payment-summary">
            <h3>Payment Summary</h3>
            <p><strong>Card Number:</strong> {cardNumber}</p>
            <p><strong>Expiry Date:</strong> {expiryDate}</p>
            <p><strong>Billing Address:</strong> {billingAddress}</p>
            <p><strong>Name on Card:</strong> {nameOnCard}</p>
          </div>

          <div className="payment-security">
            <h3>Secure Payment</h3>
            <p>Your payment details are securely processed using the latest encryption standards. Your privacy is our priority, and we do not store your credit card information.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Payment;
