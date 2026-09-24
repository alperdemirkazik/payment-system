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

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 15 }, (_, i) => currentYear + i);

    return (
        <div className="container-fluid py-5" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }}>
            <div className="row justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
                <div className="col-lg-5 col-md-8 col-sm-10 mt-5">
                    
                    {/* CANLI KREDİ KARTI GÖRSELİ (Yazı Kaldırıldı) */}
                    <div className="card text-white shadow-lg rounded-4 mx-auto" 
                         style={{ background: 'linear-gradient(45deg, #141E30 0%, #243B55 100%)', border: 'none', position: 'relative', zIndex: 2, width: '90%', marginBottom: '-40px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-end align-items-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-credit-card opacity-75" viewBox="0 0 16 16">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
                                    <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
                                </svg>
                            </div>
                            <h3 className="mb-4" style={{ letterSpacing: '4px', textShadow: '1px 1px 2px black' }}>
                                {formData.cardNumber ? formData.cardNumber.replace(/(.{4})/g, '$1 ').trim() : '**** **** **** ****'}
                            </h3>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <small className="text-uppercase" style={{ fontSize: '0.7rem', opacity: 0.7 }}>Kart Sahibi</small>
                                    <div className="fw-bold fs-6">{formData.cardHolderName ? formData.cardHolderName.toUpperCase() : 'İSİM SOYİSİM'}</div>
                                </div>
                                <div className="text-end">
                                    <small className="text-uppercase" style={{ fontSize: '0.7rem', opacity: 0.7 }}>SKT</small>
                                    <div className="fw-bold fs-6">
                                        {formData.expireMonth || 'AA'} / {formData.expireYear ? formData.expireYear.toString().slice(-2) : 'YY'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ÖDEME FORMU */}
                    <div className="card shadow-lg border-0 rounded-4 pt-5">
                        <div className="card-body p-4 p-md-5 mt-2">
                            <form onSubmit={handleSubmit}>
                                
                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="cardHolderName" name="cardHolderName" value={formData.cardHolderName} onChange={handleChange} required />
                                    <label htmlFor="cardHolderName">Kart Üzerindeki İsim</label>
                                </div>
                                
                                <div className="form-floating mb-4">
                                    <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
                                    <label htmlFor="email">E-Posta Adresi</label>
                                </div>

                                <div className="form-floating mb-3">
                                    <input type="text" className="form-control" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required maxLength="16" />
                                    <label htmlFor="cardNumber">Kart Numarası (16 Hane)</label>
                                </div>

                                <div className="row g-2 mb-4">
                                    <div className="col-4">
                                        <div className="form-floating">
                                            <select className="form-select" id="expireMonth" name="expireMonth" value={formData.expireMonth} onChange={handleChange} required>
                                                <option value="" disabled></option>
                                                {[...Array(12)].map((_, i) => {
                                                    const month = String(i + 1).padStart(2, '0');
                                                    return <option key={month} value={month}>{month}</option>
                                                })}
                                            </select>
                                            <label htmlFor="expireMonth">Ay</label>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-floating">
                                            <select className="form-select" id="expireYear" name="expireYear" value={formData.expireYear} onChange={handleChange} required>
                                                <option value="" disabled></option>
                                                {years.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                            <label htmlFor="expireYear">Yıl</label>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="form-floating">
                                            <input type="text" className="form-control" id="cvc" name="cvc" value={formData.cvc} onChange={handleChange} required maxLength="3" />
                                            <label htmlFor="cvc">CVC</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group input-group-lg mb-4 shadow-sm">
                                    <span className="input-group-text bg-dark text-white border-dark">₺</span>
                                    <input type="number" className="form-control border-dark" name="amount" value={formData.amount} onChange={handleChange} required placeholder="Ödenecek Tutarı Girin" />
                                </div>

                                <button type="submit" className="btn btn-dark btn-lg w-100 fw-bold py-3 shadow-sm rounded-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-lock-fill me-2 mb-1" viewBox="0 0 16 16">
                                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                                    </svg>
                                    Güvenli Ödeme Yap
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