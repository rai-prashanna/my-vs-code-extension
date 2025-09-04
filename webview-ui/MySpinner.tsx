import React from 'react';
// import { SyncLoader } from 'react-spinners';

interface SpinnerComponentProps {
  loading: boolean;
}

const SpinnerComponent: React.FC<SpinnerComponentProps> = ({ loading }) => {
  return (
    <div className="spinner-container" style={{ textAlign: 'left', marginTop: '1px' }}>
      {loading ? (
        <div className="spinner">
          {/* <SyncLoader color="blue" loading={loading} size={5} /> */}
          <p>🤔 Thinking...</p>
        </div>
      ) : (
        <div className="spinner-container" style={{ textAlign: 'left', marginTop: '1px' }}>
          <p>✅ Finished thinking! Responding...</p>
        </div>
      )}
    </div>
  );
};

export default SpinnerComponent;
