import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface FlightData {
  altitude: number;
  hsi: number;
  adi: number;
}

function App() {
  const [viewMode, setViewMode] = useState<'visual' | 'text'>('visual');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState<FlightData>({ altitude: 0, hsi: 0, adi: 0 });
  const [formData, setFormData] = useState<FlightData>({ altitude: 0, hsi: 0, adi: 0 });

  const fetchLatestData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/indicators/latest');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, []);

  const handleSend = async () => {
    try {
      await axios.post('http://localhost:5000/api/indicators', formData);
      setData(formData);
      setIsDialogOpen(false);
    } catch (error) {
      alert(`שגיאה: ודא שהמשתנים מוגדרים כראוי.
        Altitude (0 - 3,000)
        HIS (0 - 360)
        ADI (-100 - 100)`);
    }
  };

  const getAdiColor = (adi: number) => {    
    if(adi === 100)
      return `rgb(0, 0, 255)`;
    else if(adi === 0){
      return `rgb(0, 255, 0)`;
    } else {
      return `rgb(255,255,255)`;
    }
  };

  return (
    <div className="App">
      <header className="controls">
        <button onClick={() => setViewMode('text')}>TEXT</button>
        <button onClick={() => setViewMode('visual')}>VISUAL</button>
        <button onClick={() => {
          setFormData({
            altitude: data.altitude,
            hsi: data.hsi,
            adi: data.adi
          })
          setIsDialogOpen(true);
        }}>+</button>
      </header>

      {viewMode === 'text' && (
        <div className="text-view">
          <div className="text-card"><h3>Altitude</h3><p>{data.altitude}</p></div>
          <div className="text-card"><h3>HIS</h3><p>{data.hsi}</p></div>
          <div className="text-card"><h3>ADI</h3><p>{data.adi}</p></div>
        </div>
      )}

      {viewMode === 'visual' && (
        <div className="visual-view">
          <div className="indicator altitude-indicator">
            <div className="alt-scale">
              <span>3000</span><span>2000</span><span>1000</span><span>0</span>
            </div>
            <div className="alt-bar">
              <div className="alt-marker" style={{ bottom: `${(data.altitude / 3000) * 100}%` }}>
                <div className="arrow-left"></div>
              </div>
            </div>
          </div>

          <div className="indicator hsi-indicator">
            <div className="hsi-dial">
              <span className="deg-0">0</span>
              <span className="deg-90">90</span>
              <span className="deg-180">180</span>
              <span className="deg-270">270</span>
            </div>
            <div className="hsi-center-arrow">↑</div>
          </div>

          <div className="indicator adi-indicator" style={{ backgroundColor: getAdiColor(data.adi) }}>
          </div>
        </div>
      )}

      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>הזנת נתונים</h2>
            <div className="input-group">
              <label>Altitude</label>
              <input type="number" onChange={e => setFormData({...formData, altitude: Number(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>HIS</label>
              <input type="number" onChange={e => setFormData({...formData, hsi: Number(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>ADI</label>
              <input type="number" onChange={e => setFormData({...formData, adi: Number(e.target.value)})} />
            </div>
            <button className="send-btn" onClick={handleSend}>SEND ➡</button>
            <button className="close-btn" onClick={() => setIsDialogOpen(false)}>ביטול</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;