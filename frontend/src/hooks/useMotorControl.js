import { useState } from 'react';
import axios from 'axios';

const useMotorControl = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const sendGoHome = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await axios.post('http://localhost:8080/go_home');
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testActuator = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await axios.post('http://localhost:8080/test_actuator');
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const test_rotation = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await axios.post('http://localhost:8080/test_rotation');
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const controlAllServosDiffAngles = async (angles) => {
    if (angles.length !== 3) {
      setError("Angles array must contain exactly 10 elements");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await axios.post('http://localhost:8080/control_all_servos_diff_angles', { angles });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    sendGoHome,
    testActuator,
    test_rotation,
    controlAllServosDiffAngles,
    loading,
    error,
    success,
  };
};

export default useMotorControl;
