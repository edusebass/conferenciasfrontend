"use client"
import React, { useState, useEffect } from 'react';
import { Form, Select, Button, message, Input, Card, Modal, Table } from 'antd';
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const MatriculaForm = () => {
	const columns = [
		{
		key: "1",
		title: "ID",
		dataIndex: "id",
		},
		{
		key: "2",
		title: "Codigo",
		dataIndex: "codigo",
		},
		{
		key: "3",
		title: "Descripcion",
		dataIndex: "descripcion",
		},
		{
			key: "4",
			title: "Conferencista",
			dataIndex: "conferencista",
		},
		{
			key: "5",
			title: "Auditorio",
			dataIndex: "auditorio",
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

	interface Auditorios {
		id: number;
		_id: string;
		nombre: string;
		ubicacion: string;
		capacidad: string;
	}
	
	interface Conferencista {
		id: number;
		_id: string;
		nombre: string;
		apellido: string;
	}

	const [dataSource, setDataSource] = useState<Auditorios[]>([]); //aqui se guardar los datos obtenidos de la api
	const [dataSource2, setDataSource2] = useState<Conferencista[]>([]); //aqui se guardar los datos obtenidos de la api
	const [dataSource3, setDataSource3] = useState([]); //aqui se guardar los datos obtenidos de la api
	console.log(dataSource)
	console.log(dataSource2)
	console.log(dataSource3)

  //listar auditorios
	const fetchModule = async (token:any) => {
		try {
		const response = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/auditorios`, {
			method: "GET",
			headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
			}
		});
		console.log(response)
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
		return formattedData
		} catch (error) {
		console.log("Error:", error);
		return [];
		}
	};

  // listar conferencistas
	const fetchModules = async (token:any) => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/conferencistas`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
			});
			if (!response.ok) {
			throw new Error("Error al obtener las materias");
			}
			const data = await response.json();
			console.log(data)

			const formattedData1 = data.map((conferencista:any, index:any) => ({
        id: index + 1,
        _id: conferencista._id,
        nombre: conferencista.nombre,
        apellido: conferencista.apellido,
        cedula: conferencista.cedula,
        fechaNacimiento: new Date(conferencista.fecha_nacimiento).toISOString().split('T')[0],
        ciudad: conferencista.ciudad,
        direccion: conferencista.direccion,
        telefono: conferencista.telefono,
        email: conferencista.email,
        empresa: conferencista.empresa,
      }));
			return formattedData1 
		} catch (error) {
			console.log("Error:", error);
			return [];
		}
	};

	//obtiene lo de la tabla de reservas
	const [loadingTable, setloadingTable] = useState(false)

	const fetchModules3 = async (token:any) => {
		setloadingTable(true)
		try {
			const response = await fetch(process.env.NEXT_PUBLIC_URL_BACKEND + `/api/reservas`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			}
			});
			if (!response.ok) {
			throw new Error("Error al obtener las materias");
			}
			const data = await response.json();
			console.log(data)

			const formattedData2 = data.map((reservas:any, index:any) => ({
			id: index + 1,
			_id: reservas._id,
			codigo: reservas.codigo,
			descripcion: reservas.descripcion,
			auditorio: reservas.id_auditorio.nombre,
			conferencista: reservas.id_conferencista.nombre
			
			}));
			setloadingTable(false)
			return formattedData2 
		} catch (error) {
			console.log("Error:", error);
			return [];
		}
	};

	useEffect(() => {
		// token
		const token = localStorage.getItem('token')
		fetchModule(token).then((formattedData) => {
			setDataSource(formattedData);
		});
		fetchModules(token).then((formattedData1) => {
			setDataSource2(formattedData1);
		});
		fetchModules3(token).then((formattedData2) => {
			setDataSource3(formattedData2);
		});
	}, []);


	const { Option } = Select;
	const [form] = Form.useForm();
	const [isEditing, setIsEditing] = useState(false); //variable para modal editar
  	const [editingModule, setEditingModule] = useState<any>(null); //variable para saber si se esta editando
	const [loading, setLoading] = useState(false);

	const onSave = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem('token');
			form.validateFields().then(async (values) => {
				console.log(values)
		
				let url = `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/reserva/registro`;
				let method = 'POST';
				if (editingModule) {
					url = `${process.env.NEXT_PUBLIC_URL_BACKEND}/api/reserva/actualizar/${editingModule._id}`;
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
					setLoading(false)
					return null;
				}

				message.success(editingModule ? 'Reserva actualizada  exitosamente' : 'Reserva registrada exitosamente');
				setIsEditing(false);
				form.resetFields();
				setLoading(true)
			
				fetchModules3(token).then((formattedData) => {
					setDataSource3(formattedData);
				});
			});
		} catch (error:any) {
			console.log('Error:', error.message);
			message.error(error.message || 'Error al procesar la solicitud');
		}
	};
	
	const onEdit = (record:any) => {
		setIsEditing(true);
		setEditingModule(record);
		form.setFieldsValue(record); // Llenar el formulario con los datos del estudiante
	};

	const onDelete = async (_id:any) => {
	try {
		const token = localStorage.getItem('token');
		const response = await fetch(`${process.env.NEXT_PUBLIC_URL_BACKEND}/api/reserva/eliminar/${_id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`,
			},
		});
	
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.msg || 'Error al eliminar la reserva');
		}
	
		// Eliminar el estudiante de la lista localmente
		setDataSource((prevData) => prevData.filter((student:any) => student._id));
		console.log(dataSource)
		message.success('Reserva eliminado exitosamente');

		// Obtener la lista actualizada de estudiantes después de agregar uno nuevo
		fetchModules3(token).then((formattedData) => {
			setDataSource3(formattedData);
		});
		
		} catch (error:any) {
			console.log('Error:', error.message);
			message.error(error.message);
		}
	};

	return (
		
		<div className="App">
		<header className="App-header">
			<Button 
        onClick={() => setIsEditing(true)}
        className='mb-4'
      >
        Añadir nueva matricula
      </Button>
			<Table columns={columns} dataSource={dataSource3} loading={loadingTable} ></Table>
			{/* Modal para agregar y editar */}
			<Modal
				title={editingModule ? "Editar reserva " : "Agregar reserva "}
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
					name="codigo"
					label="Codigo"
					rules={[
						{ required: true, message: 'Ingrese por favor' },
						{ pattern: /^[0-9]+$/, message: "Ingrese solo números" }
					  ]}
					>
				<Input />
				</Form.Item>
				<Form.Item
					name="descripcion"
					label="Descripcion"
					rules={[
						{ required: true, message: 'Ingrese por favor' },

					  ]}
					>
				<Input />
				</Form.Item>
				<Form.Item
					name="id_auditorio"
					label="Auditorio"
					rules={[{ required: true, message: 'Por favor seleccione un auditorio' }]}
					>
					<Select placeholder="Seleccione un auditorio">
					{dataSource.map(auditorio => (
						<Option key={auditorio.id} value={auditorio._id}>
						{auditorio.nombre} || Capacidad: {auditorio.capacidad}
						</Option>
					))}
					</Select>
				</Form.Item>
				<Form.Item
					name="id_conferencista"
					label="Conferencista"
					rules={[{ required: true, message: 'Por favor seleccione una conferencista' }]}
					>
					<Select placeholder="Seleccione una conferencista">
					{dataSource2.map(conferencista => (
						<Option key={conferencista.id} value={conferencista._id}>
						  {conferencista.nombre} {conferencista.apellido}
						</Option>
					))}
					</Select>
				</Form.Item>
				
			</Form>
		  </Modal>
		</header>
	  </div>
		

	);
};

export default MatriculaForm;
