"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'
import { DatePicker, Form, message, Button, Table, Modal, Input } from 'antd';
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";


export default function Page() {

  // variables auth
  const { auth } = useAuth();
  console.log(auth)

  //variables crud 
  const [isEditing, setIsEditing] = useState(false); //variable para modal editar
  const [editingModule, setEditingModule] = useState<any>(null); //variable para saber si se esta editando
  const [dataSource, setDataSource] = useState([]); //aqui se guardar los datos obtenidos de la api
  const [form] = Form.useForm();

  
  // Aqui se define las columnas para la tabla de 
  // Aqui se define las columnas para la tabla de 
  const columns = [
    {
      key: "1",
      title: "ID",
      dataIndex: "id",
    },
    {
      key: "2",
      title: "Nombre",
      dataIndex: "nombre",
    },
    {
      key: "3",
      title: "Ubicacion",
      dataIndex: "ubicacion",
    },
    {
      key: "4",
      title: "Capacidad",
      dataIndex: "capacidad",
    },
    {
      key: "5",
      title: "Descripcion",
      dataIndex: "descripcion",
    },
    {
      key: "6",
      title: "Acciones",
      render: (record:any) => {
        return (
          <>
            <EditOutlined
              onClick={() => {
                onEdit(record);
              }}
            />
            <DeleteOutlined
              onClick={() => {
                onDelete(record._id);
                console.log(record.id)
              }}
              style={{ color: "red", marginLeft: 12 }}
            />
          </>
        );
      },
    },
  ];

  // listar
  const [loadingTable, setloadingTable] = useState(false)

  const fetchModule = async (token:any) => {
    setloadingTable(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auditorios`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error("Error al obtener estudiantes");
      }
      const data = await response.json();
      console.log(data)

      const formattedData = data.map((auditorios:any, index:any) => ({
        id: index + 1,
        _id: auditorios._id,
        nombre: auditorios.nombre,
        ubicacion: auditorios.ubicacion,
        capacidad: auditorios.capacidad,
        descripcion: auditorios.descripcion,
      }));
      setloadingTable(false)
      return formattedData
    } catch (error) {
      console.log("Error:", error);
      return [];
    }
  };

  
  //funcion para actualizar y registrar
  const [loading, setloading] = useState(false)
  const onSave = async () => {
    try {
      setloading(true)
      const token = localStorage.getItem('token');
      form.validateFields().then(async (values) => {
  
        let url = `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auditorio/registro`;
        let method = 'POST';
        if (editingModule) {
          url = `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auditorio/actualizar/${editingModule._id}`;
          method = 'PUT';
        }
  
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          message.error(errorData.msg)
          setloading(false)
          return null;
        }
  
        message.success(editingModule ? 'Auditorio actualizado exitosamente' : 'Auditorio registrado exitosamente');
        setIsEditing(false);
        form.resetFields();
        setloading(false)
  
        fetchModule(token).then((formattedData) => {
          setDataSource(formattedData);
        });
      });
    } catch (error:any) {
      console.log('Error:', error.message);
      message.error(error.message || 'Error al procesar la solicitud');
    }
  };

  //funcion para poder eliminar un estudiante
  const onDelete = async (_id:any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auditorio/eliminar/${_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Error al eliminar el auditorio');
      }
  
      // Eliminar el estudiante de la lista localmente
      setDataSource((prevData) => prevData.filter((student:any) => student._id));
      console.log(dataSource)
      message.success('Auditorio eliminado exitosamente');

      // Obtener la lista actualizada de estudiantes después de agregar uno nuevo
      fetchModule(token).then((formattedData) => {
        setDataSource(formattedData);
      });
      
    } catch (error:any) {
      console.log('Error:', error.message);
      message.error(error.message);
    }
  };

  //useeffect para poder enviar el mesnaje de bienvenida y obtener el token cuando
  // se despliega la tabla
    useEffect(() => {
      // Reemplaza "tu_token_aqui" con el token real
      const token = localStorage.getItem('token')
      console.log(token)
      fetchModule(token).then((formattedData) => {
      setDataSource(formattedData);
    });
  }, []);
  useEffect(() => {
    if (auth) {
      message.info(`Bienvenido: ${auth.nombre} ${auth.apellido}`);
    }
  }, [auth]); // Ejecutar efecto solo cuando 'auth' cambia
  
  // Función para abrir el modal de edición y establecer los datos del auditorio en edición
  const onEdit = (record:any) => {
    setIsEditing(true);
    setEditingModule(record);
    form.setFieldsValue(record); // Llenar el formulario con los datos del Auditorio
  };

  return (
    <>
      <div className="App">
      <header className="App-header">
        <Button 
          onClick={() => setIsEditing(true)}
          className='mb-4'
        >
          Añadir nuevo Auditorio
        </Button>
        <Table columns={columns} dataSource={dataSource} loading={loadingTable} ></Table>
        {/* Modal para agregar Auditorio */}
        <Modal
          title={editingModule ? "Editar Auditorio" : "Agregar Auditorio"}
          visible={isEditing}
          onCancel={() => {
            setIsEditing(false);
            form.resetFields();
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setIsEditing(false);
              form.resetFields();
            }}>
              Cancelar
            </Button>,
            <Button key="save" type="primary" onClick={onSave} className='bg-blue-700'
              loading={loading}
            >
              {editingModule ? 'Actualizar' : 'Guardar'}
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                { required: true, message: 'Ingrese por favor' },
                { pattern: /^[a-zA-Z]+$/, message: "Ingrese solo letras" }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="ubicacion"
              label="Ubicacion"
              rules={[{ required: true, message: 'Por favor ingrese la ubicacion' },
            ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="capacidad"
              label="Capacidad"
              rules={[
                { required: true, message: 'Ingrese por favor' },
                { pattern: /^[0-9]+$/, message: "Ingrese solo números" },
                { max: 10, message: "Máximo 4 dígitos" }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="descripcion"
              label="Descripcion"
              rules={[
                { required: true, message: 'Ingrese por favor' },
                { pattern: /^[a-zA-Z]+$/, message: "Ingrese solo letras" }
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </header>
    </div>
    </>
  )
}
