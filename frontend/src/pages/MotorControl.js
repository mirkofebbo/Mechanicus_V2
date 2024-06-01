import React, { useState } from "react";
import { Container, Typography, Button, Grid, TextField, Alert } from "@mui/material";
import useMotorControl from '../hooks/useMotorControl';

export default function MotorControl() {
  const {
    sendGoHome,
    testActuator,
    test_rotation,
    controlAllServosDiffAngles,
    loading,
    error,
    success,
  } = useMotorControl();

  const [angles, setAngles] = useState(new Array(3).fill('0'));

  const handleAnglesChange = (index, value) => {
    const newAngles = [...angles];
    newAngles[index] = value;
    setAngles(newAngles);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Motor Control
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={sendGoHome} disabled={loading}>
            Go Home
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={testActuator} disabled={loading}>
            Test Actuator
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={test_rotation} disabled={loading}>
            Test Rotation
          </Button>
        </Grid>
        <Grid item xs={12}>
          {angles.map((angle, index) => (
            <TextField
              key={index}
              label={`Angle for Servo ${index + 1}`}
              variant="outlined"
              value={angle}
              onChange={(e) => handleAnglesChange(index, e.target.value)}
              fullWidth
              margin="normal"
            />
          ))}
          <Button color="secondary" onClick={() => controlAllServosDiffAngles(angles)} disabled={loading}>
            Set All Servos to Different Angles
          </Button>
        </Grid>
        {loading && <Typography variant="body1">Loading...</Typography>}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Grid>
    </Container>
  );
}
