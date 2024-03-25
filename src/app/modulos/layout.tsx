"use client"
import ButtonLogOut from "@/components/ButtonLogOut"
import { AuthProvider } from "@/context/AuthContext"
import React from 'react';
import { Layout, Menu } from 'antd';
const { Header, Content} = Layout;
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import Link from 'next/link';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <AuthProvider>

      <Layout className=''>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div className="flex justify-between w-full items-center">
            <h1 className='text-white'>Sistemas de gestion de conferencias</h1>
            <ButtonLogOut />
          </div>

        </Header>
        <Content className='flex'>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} className='w-1/6 h-screen'>
          <Menu.Item key="1" icon={<UserOutlined />}>
            <Link href="/modulos/auditorios">
              Auditorios 
            </Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<VideoCameraOutlined />}>
            <Link href="/modulos/conferencistas">
              Conferencistas
            </Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<UploadOutlined />}>
            <Link href="/modulos/reservas">
              Reservas
            </Link>
          </Menu.Item>
        </Menu>
          <div
            style={{
              padding: 24,
              minHeight: 380,
              
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </AuthProvider>

  )
}
