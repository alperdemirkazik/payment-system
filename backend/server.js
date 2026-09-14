const express = require('express');
const cors = require('cors');
const Iyzipay = require('iyzipay');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'odemesistemi',
    password: process.env.DB_PASSWORD, // Şifre artık gizli kasadan geliyor!
    port: 5432,
});



const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,       // API Key kasadan geliyor!
    secretKey: process.env.IYZIPAY_SECRET_KEY, // Secret Key kasadan geliyor!
    uri: 'https://sandbox-api.iyzipay.com'
});

app.post('/api/payment/process', (req, res) => {
    // Arayüzden artık Email de gelecek
    const { cardHolderName, email, cardNumber, expireMonth, expireYear, cvc, amount } = req.body;

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        price: amount.toString(),
        paidPrice: amount.toString(),
        currency: Iyzipay.CURRENCY.TRY,
        installment: '1',
        basketId: 'B67832',
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        
        paymentCard: {
            cardHolderName: cardHolderName,
            cardNumber: cardNumber,
            expireMonth: expireMonth,
            expireYear: expireYear,
            cvc: cvc,
            registerCard: '0'
        },
        // Müşteri bilgisini arayüzden gelen dinamik email ile güncelledik
        buyer: {
            id: 'BY789',
            name: cardHolderName.split(' ')[0] || 'Müşteri',
            surname: cardHolderName.split(' ')[1] || 'Soyadı',
            gsmNumber: '+905350000000',
            email: email, 
            identityNumber: '74300864791',
            registrationAddress: 'Ulus Meydanı civarı',
            ip: '85.34.78.112',
            city: 'Ankara',
            country: 'Turkey'
        },
        shippingAddress: { contactName: cardHolderName, city: 'Ankara', country: 'Turkey', address: 'Merkez' },
        billingAddress: { contactName: cardHolderName, city: 'Ankara', country: 'Turkey', address: 'Merkez' },
        basketItems: [{ id: 'BI101', name: 'Hizmet Bedeli', category1: 'Yazılım', itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: amount.toString() }]
    };

    iyzipay.payment.create(request, async function (err, result) {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        
        if (result.status === 'success') {
            try {
                // SİHİRLİ DOKUNUŞ: Önce müşteriyi kaydet (veya bul), ID'sini al
                const musteriRes = await pool.query(
                    `INSERT INTO musteriler (ad_soyad, email) 
                     VALUES ($1, $2) 
                     ON CONFLICT (email) DO UPDATE SET ad_soyad = EXCLUDED.ad_soyad 
                     RETURNING id`,
                    [cardHolderName, email]
                );
                const musteriId = musteriRes.rows[0].id;

                // Sonra o ID ile ödemeyi kaydet
                await pool.query(
                    'INSERT INTO odemeler (musteri_id, islem_no, fiyat, durum) VALUES ($1, $2, $3, $4)',
                    [musteriId, result.paymentId, result.price, 'BASARILI']
                );
                console.log(`✅ Fiş Kesildi! Müşteri ID: ${musteriId}, İşlem: ${result.paymentId}`);
            } catch (dbErr) {
                console.log("Veritabanı hatası:", dbErr);
            }
        }
        res.json(result); 
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Arka plan motoru ${PORT} portunda çalışıyor!`));