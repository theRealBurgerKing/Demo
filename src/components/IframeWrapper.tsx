import React, { useEffect } from 'react';

interface IframeWrapperProps {
  children: React.ReactNode;
}

const IframeWrapper: React.FC<IframeWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Handle iframe communication if needed
    const handleMessage = (event: MessageEvent) => {
      // Add your message handling logic here
      console.log('Received message from parent:', event.data);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
};

export default IframeWrapper; 