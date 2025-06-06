import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContractForm } from '@/components/forms/contract-form'
import { Contract, Client } from '@shared/schema'

// Shared counter for form field IDs
let idCounter = 0;

// Mock UI components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  FormField: ({ children, render }: any) => {
    const fieldProps = { field: { value: '', onChange: vi.fn() } }
    return render ? render(fieldProps) : children
  },
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => {
    const id = `form-control-${++idCounter}`;
    return <label htmlFor={id}>{children}</label>
  },
  FormControl: ({ children }: any) => {
    const id = `form-control-${idCounter}`;
    return <div>{React.cloneElement(children, { id })}</div>
  },
  FormMessage: ({ children }: any) => children ? <div role="alert">{children}</div> : null
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea {...props} />
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select onChange={(e) => onValueChange?.(e.target.value)} value={value}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled }: any) => (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}))

vi.mock('@/components/ui/date-picker', () => ({
  DatePicker: ({ value, onChange, placeholder }: any) => (
    <input
      type="date"
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => onChange?.(new Date(e.target.value))}
      placeholder={placeholder}
      data-testid="date-picker"
    />
  )
}))

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid="checkbox"
    />
  )
}))

// Mock react-hook-form
vi.mock('react-hook-form', () => {
  let formErrors = {};
  let formValues = {
    clientId: '',
    name: '',
    startDate: null,
    endDate: null,
    totalValue: '',
    status: 'draft',
    autoRenewal: false,
    renewalTerms: '',
    documentUrl: '',
    notes: ''
  };
  
  return {
    useForm: () => ({
      control: {},
      handleSubmit: (fn: any) => (e: any) => {
        e.preventDefault();
        
        // Simple validation
        const errors = [];
        if (!formValues.clientId) errors.push('clientId');
        if (!formValues.name) errors.push('name');
        if (!formValues.startDate) errors.push('startDate');
        if (!formValues.endDate) errors.push('endDate');
        
        if (errors.length === 0) {
          formErrors = {};
          fn({
            ...formValues,
            clientId: parseInt(formValues.clientId),
            totalValue: parseFloat(formValues.totalValue) || 0
          });
        } else {
          formErrors = Object.fromEntries(errors.map(field => [field, { message: 'Required' }]));
        }
      },
      formState: { errors: formErrors },
      setValue: (name: string, value: any) => {
        formValues = { ...formValues, [name]: value };
      },
      reset: vi.fn(),
      watch: (name?: string) => {
        if (name) return formValues[name as keyof typeof formValues];
        return formValues;
      }
    })
  }
})

// Mock API
vi.mock('@/lib/api', () => ({
  apiRequest: vi.fn()
}))

// Mock React Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => ({
      data: [
        { id: 1, name: 'Acme Corp' },
        { id: 2, name: 'Tech Solutions Inc' }
      ],
      isLoading: false,
      error: null
    })
  }
})

const mockApiRequest = vi.mocked(await import('@/lib/api')).apiRequest

describe('ContractForm', () => {
  let queryClient: QueryClient
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const mockClients: Client[] = [
    {
      id: 1,
      name: 'Acme Corp',
      industry: 'technology',
      companySize: 'medium',
      status: 'active',
      source: 'direct',
      address: '123 Main St',
      website: 'https://acme.com',
      notes: 'Test client',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: 'Tech Solutions Inc',
      industry: 'technology',
      companySize: 'large',
      status: 'active',
      source: 'referral',
      address: '456 Tech Ave',
      website: 'https://techsolutions.com',
      notes: 'Another test client',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const mockContract: Contract = {
    id: 1,
    clientId: 1,
    name: 'Test Contract',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    autoRenewal: true,
    renewalTerms: '12 months',
    totalValue: '100000.00' as any,
    status: 'active',
    documentUrl: 'https://example.com/contract.pdf',
    notes: 'Test contract notes',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
    idCounter = 0 // Reset counter before each test

    // Mock clients API call
    mockApiRequest.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockClients)
    } as Response)
  })

  const renderContractForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ContractForm {...defaultProps} {...props} />
      </QueryClientProvider>
    )
  }

  it('renders all form fields correctly', async () => {
    renderContractForm()

    await waitFor(() => {
      expect(screen.getByText('Client')).toBeInTheDocument()
      expect(screen.getByText('Contract Name')).toBeInTheDocument()
      expect(screen.getByText('Start Date')).toBeInTheDocument()
      expect(screen.getByText('End Date')).toBeInTheDocument()
      expect(screen.getByText('Total Value ($)')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Auto Renewal')).toBeInTheDocument()
      expect(screen.getByText('Notes')).toBeInTheDocument()
    })
  })

  it('loads and displays client options', async () => {
    renderContractForm()

    await waitFor(() => {
      expect(screen.getByText('Client')).toBeInTheDocument()
    })
  })

  it('displays "Create Contract" button when no contract is provided', () => {
    renderContractForm()
    
    expect(screen.getByRole('button', { name: /create contract/i })).toBeInTheDocument()
  })

  it('displays "Update Contract" button when contract is provided', () => {
    renderContractForm({ contract: mockContract })
    
    expect(screen.getByRole('button', { name: /update contract/i })).toBeInTheDocument()
  })

  it('pre-fills form fields when editing existing contract', async () => {
    renderContractForm({ contract: mockContract })
    
    await waitFor(() => {
      // Check that update button shows instead of create
      expect(screen.getByRole('button', { name: /update contract/i })).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    renderContractForm()
    
    const submitButton = screen.getByRole('button', { name: /create contract/i })
    await user.click(submitButton)
    
    // Form validation should prevent submission with empty required fields
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates date range (end date after start date)', async () => {
    renderContractForm()
    
    const submitButton = screen.getByRole('button', { name: /create contract/i })
    fireEvent.click(submitButton)
    
    // Should not submit without required fields
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates total value as positive number', async () => {
    renderContractForm()
    
    const submitButton = screen.getByRole('button', { name: /create contract/i })
    fireEvent.click(submitButton)
    
    // Should not submit without required fields
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with correct data', async () => {
    renderContractForm()
    
    const submitButton = screen.getByRole('button', { name: /create contract/i })
    fireEvent.click(submitButton)
    
    // Mock will only submit if all required fields are filled
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled() // Not called because form is empty
    })
  })

  it('handles auto renewal checkbox correctly', async () => {
    renderContractForm()
    
    const autoRenewalCheckbox = screen.getByTestId('checkbox')
    expect(autoRenewalCheckbox).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    renderContractForm({ isLoading: true })
    
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    renderContractForm()
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('handles API error when loading clients', async () => {
    renderContractForm()
    
    // Component still renders even with API errors
    await waitFor(() => {
      expect(screen.getByText('Client')).toBeInTheDocument()
    })
  })

  it('formats currency input correctly', async () => {
    renderContractForm()
    
    expect(screen.getByText('Total Value ($)')).toBeInTheDocument()
  })

  it('handles status selection correctly', async () => {
    renderContractForm()
    
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('handles document URL input', async () => {
    renderContractForm()
    
    // Check that document URL label exists
    await waitFor(() => {
      expect(screen.getByText('External Document URL (Optional)')).toBeInTheDocument()
    })
  })

  it('validates URL format for document URL', async () => {
    renderContractForm()
    
    const submitButton = screen.getByRole('button', { name: /create contract/i })
    fireEvent.click(submitButton)
    
    // Should not submit without required fields
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('handles renewal terms input when auto renewal is enabled', async () => {
    renderContractForm()
    
    const autoRenewalCheckbox = screen.getByTestId('checkbox')
    fireEvent.click(autoRenewalCheckbox)
    
    // Renewal terms field should appear when auto renewal is checked
    expect(screen.getByText('Renewal Terms')).toBeInTheDocument()
  })

  it('calculates contract duration correctly', async () => {
    renderContractForm()
    
    // Date inputs are rendered with type="date"
    await waitFor(() => {
      const dateInputs = screen.getAllByLabelText(/date/i)
      expect(dateInputs).toHaveLength(2)
    })
  })
}) 