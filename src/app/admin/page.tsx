'use client';

import { Table, Button, Space, Modal, Form, Input, Select, message, Menu, Row, Col, Upload, Popconfirm, Tag, Spin, Empty } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ShoppingOutlined,
    AppstoreOutlined,
    TagsOutlined,
    DashboardOutlined,
    UploadOutlined,
    LoadingOutlined,
    GlobalOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useTranslations, useCreateTranslation, useUpdateTranslation, useDeleteTranslation } from '@/hooks/useTranslations';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { OrderStatusTag } from '@/components/ui/OrderStatusTag';
import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';
import { useRouter } from 'next/navigation';

const { Option } = Select;

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('orders');

    useEffect(() => {
        if (status === 'loading') return;
        const role = (session?.user as any)?.role;
        if (role !== 'ADMIN') router.replace('/');
    }, [session, status, router]);

    const userRole = (session?.user as any)?.role;
    const { data: products, isLoading: productsLoading } = useProducts();
    const { data: categories } = useCategories();
    const { data: orders, isLoading: ordersLoading } = useOrders();
    const { data: translations, isLoading: translationsLoading } = useTranslations();
    const { data: users, isLoading: usersLoading } = useUsers();
    const { mutateAsync: updateStatus } = useUpdateOrderStatus();
    const { mutateAsync: createProduct } = useCreateProduct();
    const { mutateAsync: updateProduct } = useUpdateProduct();
    const { mutateAsync: deleteProduct } = useDeleteProduct();
    const { mutateAsync: createCategory } = useCreateCategory();
    const { mutateAsync: updateCategory } = useUpdateCategory();
    const { mutateAsync: deleteCategory } = useDeleteCategory();
    const { mutateAsync: createTranslation } = useCreateTranslation();
    const { mutateAsync: updateTranslation } = useUpdateTranslation();
    const { mutateAsync: deleteTranslation } = useDeleteTranslation();
    const { mutateAsync: createUser } = useCreateUser();
    const { mutateAsync: updateUser } = useUpdateUser();
    const { mutateAsync: deleteUser } = useDeleteUser();

    // Product modal state
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [productForm] = Form.useForm();
    const [imageUrl, setImageUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    // Category modal state
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categoryForm] = Form.useForm();

    // Translation modal state
    const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
    const [editingTranslation, setEditingTranslation] = useState<any>(null);
    const [translationForm] = Form.useForm();
    const [translationSearch, setTranslationSearch] = useState('');

    // User modal state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm] = Form.useForm();

    // Guard: only ADMIN can see this page (must be after all hooks)
    if (status === 'loading' || userRole !== 'ADMIN') return null;

    // ---- Image Upload ----
    const handleImageUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImageUrl(data.url);
            onSuccess(data, file);
            message.success('Image uploaded!');
        } catch (err: any) {
            onError(err);
            message.error(err?.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // ---- Product Handlers ----
    const handleProductSubmit = async (values: any) => {
        try {
            const productData = { ...values, image: imageUrl || values.image };
            if (editingProduct) {
                await updateProduct({ id: editingProduct.id, ...productData });
                message.success('Product updated!');
            } else {
                await createProduct(productData);
                message.success('Product created!');
            }
            setIsProductModalOpen(false);
            productForm.resetFields();
            setImageUrl('');
            setEditingProduct(null);
        } catch (e) {
            message.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
        }
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setImageUrl(product.image || '');
        productForm.setFieldsValue({
            name: product.name,
            description: product.description,
            price: Number(product.price),
            categoryId: product.categoryId || product.category?.id,
        });
        setIsProductModalOpen(true);
    };

    const handleDeleteProduct = async (id: number) => {
        try {
            await deleteProduct(id);
            message.success('Product deleted!');
        } catch (e) {
            message.error('Failed to delete product');
        }
    };

    // ---- Category Handlers ----
    const handleCategorySubmit = async (values: any) => {
        try {
            if (editingCategory) {
                await updateCategory({ id: editingCategory.id, ...values });
                message.success('Category updated!');
            } else {
                await createCategory(values);
                message.success('Category created!');
            }
            setIsCategoryModalOpen(false);
            categoryForm.resetFields();
            setEditingCategory(null);
        } catch (e) {
            message.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
        }
    };

    const handleEditCategory = (category: any) => {
        setEditingCategory(category);
        categoryForm.setFieldsValue({ name: category.name });
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (id: number) => {
        try {
            await deleteCategory(id);
            message.success('Category deleted!');
        } catch (e) {
            message.error('Failed to delete category. Make sure no products use this category.');
        }
    };

    // ---- Translation Handlers ----
    const handleTranslationSubmit = async (values: any) => {
        try {
            if (editingTranslation) {
                await updateTranslation({ id: editingTranslation.id, en: values.en, uz: values.uz });
                message.success('Translation updated!');
            } else {
                await createTranslation(values);
                message.success('Translation created!');
            }
            setIsTranslationModalOpen(false);
            translationForm.resetFields();
            setEditingTranslation(null);
        } catch (e: any) {
            if (e?.response?.status === 409) {
                message.error('Translation key already exists');
            } else {
                message.error(editingTranslation ? 'Failed to update translation' : 'Failed to create translation');
            }
        }
    };

    const handleEditTranslation = (translation: any) => {
        setEditingTranslation(translation);
        translationForm.setFieldsValue({ key: translation.key, en: translation.en, uz: translation.uz });
        setIsTranslationModalOpen(true);
    };

    const handleDeleteTranslation = async (id: number) => {
        try {
            await deleteTranslation(id);
            message.success('Translation deleted!');
        } catch (e) {
            message.error('Failed to delete translation');
        }
    };

    // ---- User Handlers ----
    const handleUserSubmit = async (values: any) => {
        try {
            if (editingUser) {
                const updateData: any = { name: values.name, email: values.email, role: values.role };
                if (values.password) updateData.password = values.password;
                await updateUser({ id: editingUser.id, ...updateData });
                message.success('User updated!');
            } else {
                await createUser(values);
                message.success('User created!');
            }
            setIsUserModalOpen(false);
            userForm.resetFields();
            setEditingUser(null);
        } catch (e: any) {
            if (e?.response?.status === 409) {
                message.error('Email already exists');
            } else {
                message.error(editingUser ? 'Failed to update user' : 'Failed to create user');
            }
        }
    };

    const handleEditUser = (user: any) => {
        setEditingUser(user);
        userForm.setFieldsValue({ name: user.name, email: user.email, role: user.role });
        setIsUserModalOpen(true);
    };

    const handleDeleteUser = async (id: number) => {
        try {
            await deleteUser(id);
            message.success('User deleted!');
        } catch (e) {
            message.error('Failed to delete user');
        }
    };

    // Stats
    const totalOrders = orders?.length || 0;
    const totalProducts = products?.length || 0;
    const totalCategories = categories?.length || 0;
    const totalUsers = users?.length || 0;
    const totalRevenue = orders?.reduce((sum: number, o: any) => sum + Number(o.totalPrice), 0) || 0;

    const ROLE_COLORS: Record<string, string> = {
        ADMIN: 'red',
        COURIER: 'purple',
        TEACHER: 'blue',
        STUDENT: 'green',
    };

    const sidebarItems = [
        { key: 'orders', icon: <ShoppingOutlined />, label: 'Orders' },
        { key: 'products', icon: <AppstoreOutlined />, label: 'Products' },
        { key: 'categories', icon: <TagsOutlined />, label: 'Categories' },
        { key: 'users', icon: <TeamOutlined />, label: 'Users' },
        { key: 'translations', icon: <GlobalOutlined />, label: 'Translations' },
    ];

    const orderColumns = [
        {
            title: 'Order',
            dataIndex: 'id',
            key: 'id',
            render: (id: number) => <span style={{ fontWeight: 700, color: '#1677ff' }}>#{id}</span>,
        },
        { title: 'Customer', dataIndex: ['user', 'name'], key: 'user' },
        {
            title: 'Total',
            dataIndex: 'totalPrice',
            key: 'total',
            render: (val: any) => <span style={{ fontWeight: 600 }}>{Number(val).toLocaleString()} сўм</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: any) => (
                <Space>
                    <OrderStatusTag status={status} />
                    <Select
                        defaultValue={status}
                        size="small"
                        style={{ width: 130, borderRadius: 8 }}
                        onChange={(val) => updateStatus({ id: record.id, status: val })}
                    >
                        <Option value="PENDING">Pending</Option>
                        <Option value="ACCEPTED">Accepted</Option>
                        <Option value="COOKING">Cooking</Option>
                        <Option value="CANCELED">Canceled</Option>
                    </Select>
                </Space>
            ),
        },
        {
            title: 'Time',
            dataIndex: 'createdAt',
            key: 'time',
            render: (val: any) => (
                <span style={{ color: '#6b7280' }}>{format(new Date(val), 'MMM dd · HH:mm')}</span>
            ),
        },
    ];

    const productColumns = [
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            width: 60,
            render: (val: string) => val ? (
                <img src={val} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 16 }}>🍽️</div>
            ),
        },
        { title: 'Name', dataIndex: 'name', key: 'name', render: (val: string) => <span style={{ fontWeight: 600 }}>{val}</span> },
        { title: 'Category', dataIndex: ['category', 'name'], key: 'category' },
        { title: 'Price', dataIndex: 'price', key: 'price', render: (val: any) => <span style={{ fontWeight: 600 }}>{Number(val).toLocaleString()} сўм</span> },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" style={{ borderRadius: 8 }} onClick={() => handleEditProduct(record)} />
                    <Popconfirm
                        title="Delete this product?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDeleteProduct(record.id)}
                        okText="Delete"
                        okType="danger"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const categoryColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { title: 'Name', dataIndex: 'name', key: 'name', render: (val: string) => <span style={{ fontWeight: 600 }}>{val}</span> },
        {
            title: 'Products',
            dataIndex: 'products',
            key: 'products',
            render: (products: any[]) => <span>{products?.length || 0}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" style={{ borderRadius: 8 }} onClick={() => handleEditCategory(record)} />
                    <Popconfirm
                        title="Delete this category?"
                        description="Products using this category must be reassigned first."
                        onConfirm={() => handleDeleteCategory(record.id)}
                        okText="Delete"
                        okType="danger"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const translationColumns = [
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'key',
            render: (val: string) => <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontSize: 13 }}>{val}</code>,
        },
        {
            title: '🇬🇧 English',
            dataIndex: 'en',
            key: 'en',
            render: (val: string) => <span>{val}</span>,
        },
        {
            title: '🇺🇿 Uzbek',
            dataIndex: 'uz',
            key: 'uz',
            render: (val: string) => <span>{val}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" style={{ borderRadius: 8 }} onClick={() => handleEditTranslation(record)} />
                    <Popconfirm
                        title="Delete this translation?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDeleteTranslation(record.id)}
                        okText="Delete"
                        okType="danger"
                    >
                        <Button icon={<DeleteOutlined />} size="small" danger style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return (
                    <Table
                        dataSource={orders}
                        columns={orderColumns}
                        rowKey="id"
                        loading={ordersLoading}
                        style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}
                    />
                );
            case 'products':
                return (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProduct(null); productForm.resetFields(); setImageUrl(''); setIsProductModalOpen(true); }} style={{ borderRadius: 10 }}>
                                Add Product
                            </Button>
                        </div>
                        <Table
                            dataSource={products}
                            columns={productColumns}
                            rowKey="id"
                            loading={productsLoading}
                            style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}
                        />
                    </>
                );
            case 'categories':
                return (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCategory(null); categoryForm.resetFields(); setIsCategoryModalOpen(true); }} style={{ borderRadius: 10 }}>
                                Add Category
                            </Button>
                        </div>
                        <Table
                            dataSource={categories}
                            columns={categoryColumns}
                            rowKey="id"
                            style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}
                        />
                    </>
                );
            case 'translations':
                const filteredTranslations = translationSearch
                    ? translations?.filter((t: any) =>
                        t.key.toLowerCase().includes(translationSearch.toLowerCase()) ||
                        t.en.toLowerCase().includes(translationSearch.toLowerCase()) ||
                        t.uz.toLowerCase().includes(translationSearch.toLowerCase())
                    )
                    : translations;
                return (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                            <Input.Search
                                placeholder="Search by key, English or Uzbek..."
                                allowClear
                                value={translationSearch}
                                onChange={(e) => setTranslationSearch(e.target.value)}
                                onSearch={(val) => setTranslationSearch(val)}
                                style={{ borderRadius: 10, maxWidth: 400 }}
                            />
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTranslation(null); translationForm.resetFields(); setIsTranslationModalOpen(true); }} style={{ borderRadius: 10 }}>
                                Add Translation
                            </Button>
                        </div>
                        <Table
                            dataSource={filteredTranslations}
                            columns={translationColumns}
                            rowKey="id"
                            loading={translationsLoading}
                            style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}
                        />
                    </>
                );
            case 'users':
                const userColumns = [
                    {
                        title: 'ID',
                        dataIndex: 'id',
                        key: 'id',
                        width: 60,
                        render: (id: number) => <span style={{ fontWeight: 700, color: '#1677ff' }}>#{id}</span>,
                    },
                    { title: 'Name', dataIndex: 'name', key: 'name', render: (name: string) => <span style={{ fontWeight: 600 }}>{name}</span> },
                    { title: 'Email', dataIndex: 'email', key: 'email' },
                    {
                        title: 'Role',
                        dataIndex: 'role',
                        key: 'role',
                        render: (role: string) => <Tag color={ROLE_COLORS[role] || 'default'} style={{ fontWeight: 600, borderRadius: 6 }}>{role}</Tag>,
                    },
                    {
                        title: 'Created',
                        dataIndex: 'createdAt',
                        key: 'createdAt',
                        render: (date: string) => date ? format(new Date(date), 'MMM dd, yyyy') : '—',
                    },
                    {
                        title: 'Actions',
                        key: 'actions',
                        render: (_: any, record: any) => (
                            <Space>
                                <Button size="small" icon={<EditOutlined />} onClick={() => handleEditUser(record)} />
                                <Popconfirm title="Delete this user?" onConfirm={() => handleDeleteUser(record.id)}>
                                    <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                            </Space>
                        ),
                    },
                ];
                return (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); userForm.resetFields(); setIsUserModalOpen(true); }} style={{ borderRadius: 10 }}>
                                Add User
                            </Button>
                        </div>
                        <Table
                            dataSource={users}
                            columns={userColumns}
                            rowKey="id"
                            loading={usersLoading}
                            style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #eaeaea', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <DashboardOutlined style={{ fontSize: 20, color: '#1677ff' }} />
                        <span style={{ fontWeight: 700, fontSize: 16 }}>Admin Panel</span>
          <LogoutButton />
                    </div>
                </div>
                <Menu
                    mode="vertical"
                    selectedKeys={[activeTab]}
                    items={sidebarItems}
                    onClick={({ key }) => setActiveTab(key)}
                    style={{ border: 'none' }}
                />
            </div>

            {/* Content */}
            <div className="admin-content">
                {/* Stat Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={12} md={6}>
                        <div className="stat-card">
                            <div className="stat-value">{totalOrders}</div>
                            <div className="stat-label">Total Orders</div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="stat-card">
                            <div className="stat-value">{totalProducts}</div>
                            <div className="stat-label">Products</div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="stat-card">
                            <div className="stat-value">{totalCategories}</div>
                            <div className="stat-label">Categories</div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="stat-card">
                            <div className="stat-value">{totalUsers}</div>
                            <div className="stat-label">Users</div>
                        </div>
                    </Col>
                </Row>

                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, textTransform: 'capitalize' }}>
                    {activeTab}
                </h2>
                {renderContent()}
            </div>

            {/* Add/Edit Product Modal */}
            <Modal
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                open={isProductModalOpen}
                onCancel={() => { setIsProductModalOpen(false); setEditingProduct(null); setImageUrl(''); productForm.resetFields(); }}
                footer={null}
                style={{ borderRadius: 16 }}
            >
                <Form form={productForm} layout="vertical" onFinish={handleProductSubmit} style={{ marginTop: 16 }}>
                    <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                        <Input style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item name="price" label="Price (сўм)" rules={[{ required: true }]}>
                        <Input type="number" step="100" suffix="сўм" style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
                        <Select style={{ borderRadius: 10 }}>
                            {categories?.map((cat: any) => (
                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Product Image">
                        <Upload
                            name="file"
                            listType="picture-card"
                            showUploadList={false}
                            customRequest={handleImageUpload}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                        >
                            {imageUrl ? (
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <img
                                        src={imageUrl}
                                        alt="Product"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    {uploading ? <LoadingOutlined /> : <UploadOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                                        {uploading ? 'Uploading...' : 'Click or drag'}
                                    </span>
                                </div>
                            )}
                        </Upload>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>Max 5MB · JPEG, PNG, WebP, GIF</span>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
                            {editingProduct ? 'Update Product' : 'Save Product'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add/Edit Category Modal */}
            <Modal
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                open={isCategoryModalOpen}
                onCancel={() => { setIsCategoryModalOpen(false); setEditingCategory(null); categoryForm.resetFields(); }}
                footer={null}
                style={{ borderRadius: 16 }}
            >
                <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit} style={{ marginTop: 16 }}>
                    <Form.Item name="name" label="Category Name" rules={[{ required: true, message: 'Category name is required' }]}>
                        <Input placeholder="e.g. Beverages, Main Course..." style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
                            {editingCategory ? 'Update Category' : 'Save Category'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add/Edit Translation Modal */}
            <Modal
                title={editingTranslation ? 'Edit Translation' : 'Add New Translation'}
                open={isTranslationModalOpen}
                onCancel={() => { setIsTranslationModalOpen(false); setEditingTranslation(null); translationForm.resetFields(); }}
                footer={null}
                style={{ borderRadius: 16 }}
            >
                <Form form={translationForm} layout="vertical" onFinish={handleTranslationSubmit} style={{ marginTop: 16 }}>
                    <Form.Item name="key" label="Key" rules={[{ required: true, message: 'Key is required' }]}>
                        <Input
                            placeholder="e.g. menu.title, button.submit..."
                            style={{ borderRadius: 10 }}
                            disabled={!!editingTranslation}
                        />
                    </Form.Item>
                    <Form.Item name="en" label="🇬🇧 English" rules={[{ required: true, message: 'English value is required' }]}>
                        <Input.TextArea rows={2} placeholder="English translation..." style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item name="uz" label="🇺🇿 O'zbekcha" rules={[{ required: true, message: 'Uzbek value is required' }]}>
                        <Input.TextArea rows={2} placeholder="O'zbek tilidagi tarjima..." style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
                            {editingTranslation ? 'Update Translation' : 'Save Translation'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add/Edit User Modal */}
            <Modal
                title={editingUser ? 'Edit User' : 'Add New User'}
                open={isUserModalOpen}
                onCancel={() => { setIsUserModalOpen(false); setEditingUser(null); userForm.resetFields(); }}
                footer={null}
                style={{ borderRadius: 16 }}
            >
                <Form form={userForm} layout="vertical" onFinish={handleUserSubmit} style={{ marginTop: 16 }}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Name is required' }]}>
                        <Input placeholder="e.g. John Doe" style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email is required' }]}>
                        <Input placeholder="e.g. user@example.com" style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                        rules={editingUser ? [] : [{ required: true, message: 'Password is required' }]}
                    >
                        <Input.Password placeholder="••••••••" style={{ borderRadius: 10 }} />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Role is required' }]}>
                        <Select placeholder="Select role" style={{ borderRadius: 10 }}>
                            <Option value="STUDENT">🎓 Student</Option>
                            <Option value="TEACHER">👨‍🏫 Teacher</Option>
                            <Option value="COURIER">🚚 Courier</Option>
                            <Option value="ADMIN">🔐 Admin</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
                            {editingUser ? 'Update User' : 'Create User'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
