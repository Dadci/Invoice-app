// Default service types
export const DEFAULT_SERVICE_TYPES = [
    { id: 'web-design', name: 'Web Design Service' },
    { id: 'graphic-design', name: 'Graphic Design Service' },
    { id: 'web-development', name: 'Web Development Service' },
    { id: 'ux-design', name: 'UX/UI Design Service' },
    { id: 'content-writing', name: 'Content Writing Service' },
    { id: 'seo-service', name: 'SEO Service' },
    { id: 'consultation', name: 'Consultation Service' },
    { id: 'maintenance', name: 'Maintenance Service' },
    { id: 'other', name: 'Other Service' }
];

// Default service type IDs (used to prevent deletion of default service types)
export const DEFAULT_SERVICE_TYPE_IDS = DEFAULT_SERVICE_TYPES.map(type => type.id);

// Color mapping for different service types
export const SERVICE_TYPE_COLORS = {
    'web-design': '#7C5DFA',
    'graphic-design': '#33D69F',
    'web-development': '#6460FF',
    'ux-design': '#FF8F00',
    'content-writing': '#EB5757',
    'seo-service': '#9277FF',
    'consultation': '#F2C94C',
    'maintenance': '#219653',
    'other': '#828FA3'
};

// Get a consistent color for a service type
export const getServiceTypeColor = (serviceTypeId) => {
    return SERVICE_TYPE_COLORS[serviceTypeId] || '#7C5DFA';
}; 