import { useState } from 'react';

function App() {
    const [formData, setFormData] = useState({
        cardHolderName: '',
        email: '',
        cardNumber: '',
        expireMonth: '',
        expireYear: '',
        cvc: '',
        amount: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            
            if (data.status === 'success') {
                alert(`✅ Ödeme Başarılı! İşlem No: ${data.paymentId}`);
            } else {
                alert(`❌ Hata: ${data.errorMessage}`);
            }
        } catch (error) {
            console.error('İşlem sırasında hata oluştu:', error);
            alert('Sunucuya ulaşılamadı!');
        }
    };

    // Yılları dinamik olarak bugünden itibaren 15 yıl ileriye kadar hesaplıyoruz
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

    return (
        <div className="container py-5" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8">
                    <div className="card shadow-lg border-0 rounded-4">
                        <div className="card-header bg-dark text-white text-center py-3 rounded-top-4">
                            <h4 className="mb-0">💳 Güvenli Ödeme Noktası</h4>
                        </div>
                        
                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit}>
                                {/* Müşteri Bilgileri */}
                                <h5 className="mb-3 text-secondary border-bottom pb-2">Kişisel Bilgiler</h5>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Kart Üzerindeki İsim</label>
                                    <input type="text" className="form-control form-control-lg" name="cardHolderName" value={formData.cardHolderName} onChange={handleChange} required />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">E-Posta Adresi</label>
                                    <input type="email" className="form-control form-control-lg" name="email" value={formData.email} onChange={handleChange} required />
                                </div>

                                {/* Kart Bilgileri */}
                                <h5 className="mb-3 text-secondary border-bottom pb-2">Kart Bilgileri</h5>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Kart Numarası</label>
                                    <input type="text" className="form-control form-control-lg" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required maxLength="16" />
                                </div>

                                <div className="row">
                                    <div className="col-4 mb-3">
                                        <label className="form-label fw-semibold">Ay</label>
                                        <select className="form-select form-select-lg text-center" name="expireMonth" value={formData.expireMonth} onChange={handleChange} required>
                                            <option value="" disabled>Seç</option>
                                            {[...Array(12)].map((_, i) => {
                                                const month = String(i + 1).padStart(2, '0');
                                                return <option key={month} value={month}>{month}</option>
                                            })}
                                        </select>
                                    </div>
                                    <div className="col-4 mb-3">
                                        <label className="form-label fw-semibold">Yıl</label>
                                        <select className="form-select form-select-lg text-center" name="expireYear" value={formData.expireYear} onChange={handleChange} required>
                                            <option value="" disabled>Seç</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-4 mb-4">
                                        <label className="form-label fw-semibold">CVC</label>
                                        <input type="text" className="form-control form-control-lg text-center" name="cvc" value={formData.cvc} onChange={handleChange} required maxLength="3" />
                                    </div>
                                </div>

                                {/* Ödeme Tutarı ve Buton */}
                                <div className="mb-4 bg-light p-3 rounded border">
                                    <label className="form-label fw-bold text-dark">Ödenecek Tutar (TL)</label>
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white">₺</span>
                                        <input type="number" className="form-control" name="amount" value={formData.amount} onChange={handleChange} required />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold py-3 shadow-sm">
                                    🔒 Ödemeyi Tamamla
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;