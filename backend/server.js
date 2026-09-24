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
    password: process.env.DB_PASSWORD, 
    port: 5432,
});

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,       
    secretKey: process.env.IYZIPAY_SECRET_KEY, 
    uri: 'https://sandbox-api.iyzipay.com'
});

pool.query(`


  CREATE TABLE IF NOT EXISTS ogrenciler (
      id SERIAL PRIMARY KEY,
      ad_soyad VARCHAR(100),
      telefon VARCHAR(20),
      seviye VARCHAR(50),
      kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).catch(err => console.error("Tablo oluşturma hatası:", err));

// -- YENİ EKLENEN KISIM: TEST ROTASI --
app.get('/api/test', (req, res) => {
    res.send("Selam kanka, ben backend! Yeni kodları başarıyla okuyorum.");
});

// -- YENİ EKLENEN KISIM: KURS KAYIT ROTASI --
app.post('/api/kayit', async (req, res) => {
    try {
        // React'ten gelen verileri al
        const { adSoyad, telefon, seviye } = req.body;
        
        // Veritabanına kaydet
        await pool.query(
            'INSERT INTO ogrenciler (ad_soyad, telefon, seviye) VALUES ($1, $2, $3)',
            [adSoyad, telefon, seviye]
        );
        
        console.log(`[ÖĞRENCİ KAYDI BAŞARILI] ${adSoyad}`);
        res.status(200).json({ message: "Kayıt başarılı, ödemeye yönlendiriliyor." });
        
    } catch (error) {
        console.error("[KAYIT HATASI]:", error);
        res.status(500).json({ status: "error", message: "Sunucu hatası" });
    }
});

app.post('/api/payment/process', (req, res) => {
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
        // KİŞİSEL VERİLER STANDART TEST VERİLERİYLE DEĞİŞTİRİLDİ
        buyer: {
            id: 'BY789',
            name: cardHolderName.split(' ')[0] || 'Musteri',
            surname: cardHolderName.split(' ')[1] || 'Soyadi',
            gsmNumber: '+905555555555',
            email: email, 
            identityNumber: '11111111111', 
            registrationAddress: 'Musteri Adresi Belirtilmedi',
            ip: '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey'
        },
        shippingAddress: { contactName: cardHolderName, city: 'Istanbul', country: 'Turkey', address: 'Musteri Adresi Belirtilmedi' },
        billingAddress: { contactName: cardHolderName, city: 'Istanbul', country: 'Turkey', address: 'Musteri Adresi Belirtilmedi' },
        basketItems: [{ id: 'BI101', name: 'Hizmet Bedeli', category1: 'Yazilim', itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL, price: amount.toString() }]
    };

    iyzipay.payment.create(request, async function (err, result) {
        if (err) return res.status(500).json({ status: "error", message: err.message });
        
        if (result.status === 'success') {
            try {
                const musteriRes = await pool.query(
                    `INSERT INTO musteriler (ad_soyad, email) 
                     VALUES ($1, $2) 
                     ON CONFLICT (email) DO UPDATE SET ad_soyad = EXCLUDED.ad_soyad 
                     RETURNING id`,
                    [cardHolderName, email]
                );
                const musteriId = musteriRes.rows[0].id;

                await pool.query(
                    'INSERT INTO odemeler (musteri_id, islem_no, fiyat, durum) VALUES ($1, $2, $3, $4)',
                    [musteriId, result.paymentId, result.price, 'BASARILI']
                );
                console.log(`[BAŞARILI KAYIT] Müşteri ID: ${musteriId}, İşlem: ${result.paymentId}`);
            } catch (dbErr) {
                console.error("[VERİTABANI HATASI]:", dbErr);
            }
        }
        res.json(result); 
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`[SİSTEM] Arka plan motoru ${PORT} portunda aktif.`));