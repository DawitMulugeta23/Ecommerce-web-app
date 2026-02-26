import axios from "axios";

export const initializePayment = async (req, res) => {
  // ከፍሮንትኤንድ የሚመጡ መረጃዎች
  const { amount, email, firstName, lastName } = req.body;

  // ለእያንዳንዱ ክፍያ ልዩ መለያ ቁጥር (Transaction Reference)
  const tx_ref = `tx-mystore-${Date.now()}`;

  try {
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: amount,
        currency: "ETB",
        email: email,
        first_name: firstName,
        last_name: lastName,
        tx_ref: tx_ref,
        callback_url: `http://localhost:5000/api/payments/verify/${tx_ref}`,
        return_url: "http://localhost:5173/success", // ክፍያው ሲያልቅ ተጠቃሚው የሚመለስበት ገጽ
        "customization[title]": "My Store Payment",
        "customization[description]": "Payment for your order",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Chapa የላከውን መረጃ (checkout_url-ን ጨምሮ) ለፍሮንትኤንድ መመለስ
    res.json(response.data);
  } catch (error) {
    console.error("Chapa API Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "ክፍያ ማስጀመር አልተቻለም",
      error: error.response?.data || error.message,
    });
  }
};

// ክፍያውን ማረጋገጫ (Verify)
export const verifyPayment = async (req, res) => {
  const { tx_ref } = req.params;
  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "ማረጋገጥ አልተቻለም", error: error.message });
  }
};

// Webhook ከ Chapa የሚመጣውን መረጃ ለመቀበል
export const chapaWebhook = async (req, res) => {
  try {
    const eventData = req.body;

    console.log("Webhook received:", eventData);

    // ክፍያው ስኬት መሆኑን አረጋግጥ
    if (eventData.event === "charge.success") {
      const { tx_ref, amount, customer } = eventData.data;

      // እዚህ ጋር ትዕዛዙን ማዘመን፣ ኢሜይል መላክ ወዘተ ታደርጋለህ
      console.log(`ክፍያ ተሳክቷል! ማመሳከሪያ: ${tx_ref}, ገንዘብ: ${amount}`);

      // ለምሳሌ፡ ትዕዛዙን ከውሂብ ጎታ ላይ አዘምን
      // await Order.findOneAndUpdate({ tx_ref }, { status: 'paid' });

      // ኢሜይል ለደንበኛው ላክ (በኋላ ላይ እንጨምራለን)
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: error.message });
  }
};
