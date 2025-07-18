import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectToSwap: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/swap', { replace: true });
  }, [navigate]);
  return null;
};

export default RedirectToSwap;