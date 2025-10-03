import { useState } from "react";
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../store";
import { loginSuccess } from "../store/authSlice";
import api from "../api"; 
import { useMessage } from "../context/MessageContext";

const { Title, Paragraph } = Typography;

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success } = useMessage();

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", values);
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      navigate("/projects", { replace: true });
      success(data.message);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 360 }}>
        <Title level={3} style={{ textAlign: "center" }}>Sign In</Title>

        {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input placeholder="you@example.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters long" },
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form>

        <Paragraph style={{ marginTop: 12, textAlign: "center" }}>
          Don’t have an account? <Link to="/register">Create one</Link>
        </Paragraph>
      </Card>
    </div>
  );
};

export default LoginPage;
