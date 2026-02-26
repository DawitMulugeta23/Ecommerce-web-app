import axios from "axios";

// 1. ክፍያ ለመጀመር (Initialize)
export const initializeChapaPayment = async (req, res) => {
  const { amount, email, firstName, lastName, tx_ref } = req.body;

  try {
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        first_name: firstName,
        last_name: lastName,
        tx_ref,
        callback_url: "http://localhost:5000/api/payments/webhook",
        return_url: `http://localhost:5173/order-success/${tx_ref}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Chapa የሚመልሰው ዳታ ውስጥ 'status': 'success' ከሆነ ብቻ ነው ወደ ክፍያ የምንሄደው
    if (response.data.status === "success") {
      res.json(response.data);
    } else {
      res.status(400).json({ message: "Chapa initialization failed" });
    }
  } catch (error) {
    console.error("Chapa Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: error.response?.data?.message || error.message });
  }
};

// 2. ክፍያ መፈጸሙን ለማረጋገጥ (Verify)
export const verifyPayment = async (req, res) => {
  const { tx_ref } = req.params;
  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      },
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Verification failed", error: error.message });
  }
};

// 3. ለ Chapa Webhook
export const chapaWebhook = async (req, res) => {
  // Chapa መረጃውን ሲልክ እዚህ ጋር ይቀበላል
  res.status(200).send("Webhook received");
};

// 4. የክፍያ መንገዶችን ለመዘርዘር
export const getPaymentMethods = async (req, res) => {
  res.json({
    methods: [
      { id: "chapa", name: "Chapa", enabled: true },
      { id: "telebirr", name: "Telebirr", enabled: false }, // ለጊዜው ፎልስ አድርገው
      { id: "cbebirr", name: "CBE Birr", enabled: false },
    ],
  });
};

// እነዚህን ከታች ያሉትን ለጊዜው ባዶ ፈንክሽን አድርጋቸው (Route ላይ ስለተጠሩ Error እንዳይመጣ)
export const initializeTelebirrPayment = (req, res) =>
  res.status(501).json({ message: "Not implemented" });
export const initializeCbeBirrPayment = (req, res) =>
  res.status(501).json({ message: "Not implemented" });
