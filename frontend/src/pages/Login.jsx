import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Form, Input, Button, Card, message, Modal } from "antd"
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons"
import { useAuth } from "../context/AuthContext"
import { register } from "../services/api"

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [registerForm] = Form.useForm()
  const { login } = useAuth()
  const navigate = useNavigate()

  const onLogin = async (values) => {
    setLoading(true)
    try {
      await login(values.username, values.password)
      message.success("登录成功")
      navigate("/")
    } catch (err) {
      // Error already handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async () => {
    try {
      const values = await registerForm.validateFields()
      setLoading(true)
      await register({
        username: values.username,
        password: values.password,
        nickname: values.nickname,
        email: values.email,
        phone: values.phone,
      })
      message.success("注册成功，请登录")
      setRegisterOpen(false)
      registerForm.resetFields()
    } catch (err) {
      // Error already handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}>
      <Card title={"图书管理系统"} style={{ width: 400 }}>
        <Form onFinish={onLogin} size="large">
          <Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
            <Input prefix={<UserOutlined />} placeholder={"用户名"} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={"密码"} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {"登录"}
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Button type="link" onClick={() => setRegisterOpen(true)}>
              {"没有账号？立即注册"}
            </Button>
          </div>
        </Form>
      </Card>
      <Modal
        title={"用户注册"}
        open={registerOpen}
        onOk={onRegister}
        onCancel={() => { setRegisterOpen(false); registerForm.resetFields() }}
        confirmLoading={loading}
        destroyOnClose
        width={500}
      >
        <Form form={registerForm} layout="vertical">
          <Form.Item
            name="username"
            label={"用户名"}
            rules={[
              { required: true, message: "请输入用户名" },
              { min: 3, message: "用户名至少3个字符" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder={"请输入用户名"} />
          </Form.Item>
          <Form.Item
            name="password"
            label={"密码"}
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少6个字符" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={"请输入密码"} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={"确认密码"}
            dependencies={["password"]}
            rules={[
              { required: true, message: "请确认密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("两次密码不一致"))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={"请再次输入密码"} />
          </Form.Item>
          <Form.Item name="nickname" label={"昵称"}>
            <Input prefix={<UserOutlined />} placeholder={"请输入昵称（选填）"} />
          </Form.Item>
          <Form.Item
            name="email"
            label={"邮箱"}
            rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
          >
            <Input prefix={<MailOutlined />} placeholder={"请输入邮箱（选填）"} />
          </Form.Item>
          <Form.Item
            name="phone"
            label={"手机号"}
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder={"请输入手机号（选填）"} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
