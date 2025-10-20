import React from 'react';
// import { SyncLoader } from 'react-spinners';

interface SpinnerComponentProps {
  thinking: boolean;
  responding: boolean;
}

const SpinnerComponent: React.FC<SpinnerComponentProps> = ({ thinking,responding }) => {
  return (
    <div className="spinner-container" style={{ textAlign: 'left', marginTop: '1px' }}>
      {thinking &&
        <div className="spinner">
          {/* <SyncLoader color="blue" loading={loading} size={5} /> */}
          <p>🤔 Thinking...</p>
        </div>
      }
      {responding &&
        <div className="spinner-container" style={{ textAlign: 'left', marginTop: '1px' }}>
          <p>✅ Finished thinking! Responding...</p>
        </div>
      }
    </div>
  );
};

export default SpinnerComponent;
