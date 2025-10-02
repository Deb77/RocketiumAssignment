import { useState } from "react";
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "../store";
import { loginSuccess } from "../store/authSlice";
import api from "../api"; // Axios instance

const { Title, Paragraph } = Typography;

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: { name: string; email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", values);
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      navigate("/projects");
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>Create an account</Title>
        {error && <Alert type="error" message={error} style={{ marginBottom: 12 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Your name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create account
          </Button>
        </Form>
        <Paragraph style={{ marginTop: 12, textAlign: "center" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </Paragraph>
      </Card>
    </div>
  );
};

export default RegisterPage;
