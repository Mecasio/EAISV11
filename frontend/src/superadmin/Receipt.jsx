import React from "react";

export default function Receipt() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @page {
          size: A5;
          margin: 10mm;
        }

        body {
          font-family: Arial, sans-serif;
        }

        .controls {
          margin: 20px;
        }

        button {
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
        }

        @media print {
          .controls {
            display: none;
          }
          body {
            margin: 0;
          }
        }

        .receipt-container {
          display: flex;
          justify-content: center;
        }

        .receipt {
          width: 148mm;
          height: 210mm;
          border: 2px solid #1f4fbf;
          padding: 15px;
          box-sizing: border-box;
          color: #1f4fbf;
          display: flex;
          flex-direction: column;
        }

        .top-line {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .header {
          text-align: center;
          margin-top: 10px;
        }

        .invoice-row {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }

        .invoice-label {
          background: #1f4fbf;
          color: white;
          padding: 5px 10px;
          font-weight: bold;
        }

        .invoice-info span {
          margin-left: 20px;
        }

        .field {
          border-bottom: 1px solid #1f4fbf;
          margin-top: 15px;
          padding-bottom: 5px;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          background: #1f4fbf;
          color: white;
          padding: 5px 10px;
          margin-top: 15px;
        }

        .table-body {
          height: 90px;
          border: 1px solid #1f4fbf;
          border-top: none;
        }

        .total {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          border-top: 2px solid #1f4fbf;
          padding-top: 5px;
          font-weight: bold;
        }

        .amount-words {
          border-bottom: 1px solid #1f4fbf;
          margin-top: 10px;
          padding-bottom: 5px;
        }

        .payment-section {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }

        .payment-types div {
          margin-bottom: 5px;
        }

        .bank-details {
          display: flex;
          gap: 20px;
        }

        .received {
          margin-top: 20px;
        }

        .collecting-office {
          margin-top: 30px;
          text-align: center;
          border-top: 1px solid #1f4fbf;
          padding-top: 5px;
          width: 200px;
          margin-left: auto;
          margin-right: auto;
        }
      `}</style>

      <div className="controls">
        <button onClick={handlePrint}>Print Receipt</button>
      </div>

      <div className="receipt-container">
        <div className="receipt">

          <div className="top-line">
            <span>Accountable Form No. 51, Revised January, 1992</span>
            <span>(Triplicate)</span>
          </div>

          <div className="header">
            <h3>Republic of the Philippines</h3>
            <h4>EULOGIO "AMANG" RODRIGUEZ</h4>
            <h4>INSTITUTE OF SCIENCE AND TECHNOLOGY</h4>
            <p>Nagtahan, Sampaloc, Manila</p>
          </div>

          <div className="invoice-row">
            <div className="invoice-label">INVOICE</div>
            <div className="invoice-info">
              <span>No.</span>
              <span>Date</span>
            </div>
          </div>

          <div className="field">PAYOR</div>

          <div className="table-header">
            <div>NATURE OF COLLECTION</div>
            <div>AMOUNT</div>
          </div>

          <div className="table-body"></div>

          <div className="total">
            <span>TOTAL AMOUNT PAID</span>
            <span>₱</span>
          </div>

          <div className="amount-words">
            Amount in words
          </div>

          <div className="payment-section">
            <div className="payment-types">
              <div><input type="checkbox" /> Cash</div>
              <div><input type="checkbox" /> Check</div>
              <div><input type="checkbox" /> Money Order</div>
            </div>

            <div className="bank-details">
              <div>Drawee Bank</div>
              <div>Number</div>
              <div>Date</div>
            </div>
          </div>

          <div className="received">
            Received the Amount Stated Above
          </div>

          <div className="collecting-office">
            Collecting Office
          </div>

        </div>
      </div>
    </>
  );
}