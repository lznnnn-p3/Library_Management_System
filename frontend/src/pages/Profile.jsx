import { useEffect, useState } from "react"
import { Card, Form, Input, Button, message, Descriptions, Divider } from "antd"
import { UserOutlined, MailOutlined, PhoneOutlined, SaveOutlined } from "@ant-design/icons"
import { getProfile, updateProfile } from "../services/api"
import { useAuth } from "../context/AuthContext"

export default function Profile() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [form] = Form.useForm()
  const { user } = useAuth()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await getProfile()
      setProfile(res.data)
      form.setFieldsValue(res.data)
    } catch (e) {
      message.error("获取用户信息失败")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await updateProfile(values)
      message.success("更新成功")
      fetchProfile()
    } catch (e) {
      // validation error or API error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{"个人信息"}</h2>
      <Card loading={loading}>
        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label={"用户名"}>{profile?.username}</Descriptions.Item>
          <Descriptions.Item label={"角色"}>{user?.roles?.join(", ") || "-"}</Descriptions.Item>
          <Descriptions.Item label={"注册时间"}>{profile?.createTime}</Descriptions.Item>
        </Descriptions>

        <Divider>{"编辑信息"}</Divider>

        <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item name="nickname" label={"昵称"}>
            <Input prefix={<UserOutlined />} placeholder={"请输入昵称"} />
          </Form.Item>
          <Form.Item
            name="email"
            label={"邮箱"}
            rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
          >
            <Input prefix={<MailOutlined />} placeholder={"请输入邮箱"} />
          </Form.Item>
          <Form.Item
            name="phone"
            label={"手机号"}
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder={"请输入手机号"} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              {"保存修改"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
