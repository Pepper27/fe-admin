export const pathAdmin = process.env.REACT_APP_API_URL;

// API endpoints
export const adminEndpoints = {
    // Size management
    sizes: {
        list: '/v1/admin/sizes',
        create: '/v1/admin/sizes',
        update: (id) => `/v1/admin/sizes/${id}`,
        delete: (id) => `/v1/admin/sizes/${id}`
    },
    
    // Color management
    colors: {
        list: '/v1/admin/colors',
        create: '/v1/admin/colors',
        update: (id) => `/v1/admin/colors/${id}`,
        delete: (id) => `/v1/admin/colors/${id}`
    },
    
    // Material management
    materials: {
        list: '/v1/admin/materials',
        create: '/v1/admin/materials',
        update: (id) => `/v1/admin/materials/${id}`,
        delete: (id) => `/v1/admin/materials/${id}`
    }
}

// Common API functions
export const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token')
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        credentials: 'include'
    }
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    }
    
    try {
        const response = await fetch(`${pathAdmin}${endpoint}`, finalOptions)
        const data = await response.json()
        
        if (!response.ok) {
            throw new Error(data.message || 'API call failed')
        }
        
        return data
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
} 

// Fetch current admin account with fallback between /admin and /v1/admin
export const fetchAdminUser = async () => {
    const token = localStorage.getItem('token')
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }

    const tryUrls = [
        `${pathAdmin}/admin/account/user`,
        `${pathAdmin}/v1/admin/account/user`
    ]

    for (const url of tryUrls) {
        try {
            const res = await fetch(url, { method: 'GET', headers, credentials: 'include' })
            if (res.status === 404) continue
            const data = await res.json()
            // return full response object structure to callers
            return { ok: res.ok, status: res.status, data }
        } catch (err) {
            // try next
            continue
        }
    }

    // All attempts failed
    return { ok: false, status: 0, data: null }
}
    
