import { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';

function App() {
  const [formData, setFormData] = useState({
    cardHolderName: 'Alper Demirkazık',
    cardNumber: '',
    expirationDate: '',
    cvc: '',
    amount: '250.75'
    
  });

  const [mesaj, setMesaj] = useState({ tip: '', metin: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      let rawValue = value.replace(/\D/g, '');
      if (rawValue.length > 16) rawValue = rawValue.slice(0, 16);
      formattedValue = rawValue.replace(/(\d{4})/g, '$1 ').trim();
    } 
    else if (name === 'expirationDate') {
      let rawValue = value.replace(/\D/g, '');
      if (rawValue.length > 4) rawValue = rawValue.slice(0, 4);
      if (rawValue.length >= 3) {
        formattedValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}`;
      } else {
        formattedValue = rawValue;
      }
    }
    else if (name === 'cvc') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData({ ...formData, [name]: formattedValue });
  };

  const odemeYap = async (e) => {
    e.preventDefault();
    setMesaj({ tip: 'info', metin: 'Iyzico ile görüşülüyor, şifreli tünel açılıyor...' });

    // C# / Node backend'in kafası karışmasın diye veriyi Iyzico formatına çeviriyoruz
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    const [month, year] = formData.expirationDate.split('/');
    const fullYear = year ? `20${year}` : ''; // YY'yi YYYY formatına çevir (Örn: 28 -> 2028)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          cardHolderName: formData.cardHolderName,
          cardNumber: cleanCardNumber,
          expireMonth: month,
          expireYear: fullYear,
          cvc: formData.cvc,
          amount: parseFloat(formData.amount)
        })
      });

      const data = await response.json();

      // Iyzico bize "success" veya "failure" döner
      if (data.status === 'success') {
        setMesaj({ tip: 'success', metin: 'Ödeme Başarılı! 💸 Milyon dolarlık sisteme hoş geldin.' });
      } else {
        // Iyzico'nun red sebebini (limit yetersiz, kart geçersiz vs.) ekrana basalım
        setMesaj({ tip: 'danger', metin: `Hata: ${data.errorMessage}` });
      }
    } catch {
      setMesaj({ tip: 'danger', metin: 'Sunucuya ulaşılamıyor. Arka plan motoru (5000) açık mı?' });
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Card className="shadow-lg border-0" style={{ width: '420px', borderRadius: '15px' }}>
        <Card.Body className="p-5">
          <h3 className="text-center mb-4 fw-bold text-primary">💳 Iyzico Ödeme</h3>
          
          {mesaj.metin && <Alert variant={mesaj.tip}>{mesaj.metin}</Alert>}

          <Form onSubmit={odemeYap}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Kart Sahibinin Adı</Form.Label>
              <Form.Control type="text" name="cardHolderName" value={formData.cardHolderName} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Kart Numarası</Form.Label>
              <Form.Control type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
  <Form.Label className="fw-semibold">E-Posta Adresi</Form.Label>
  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
</Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Son Kullanma</Form.Label>
                  <Form.Control type="text" name="expirationDate" placeholder="AA/YY" value={formData.expirationDate} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">CVV</Form.Label>
                  <Form.Control type="password" name="cvc" placeholder="***" value={formData.cvc} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Tutar (₺)</Form.Label>
              <Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" required />
            </Form.Group>

            <Button type="submit" variant="primary" size="lg" className="w-100 fw-bold shadow-sm">Ödemeyi Tamamla</Button>
          </Form>

        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;