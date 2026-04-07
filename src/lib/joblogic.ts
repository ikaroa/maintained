/**
 * Joblogic API Client
 * Integrates with the Joblogic Field Service Management REST API.
 * Docs: https://apidocs.joblogic.com/
 */

const BASE_URL = process.env.JOBLOGIC_API_BASE_URL || "https://api.joblogic.com";

interface JoblogicConfig {
  apiKey?: string;
  username?: string;
  password?: string;
  token?: string;
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch(`${BASE_URL}/api/v2/authentication/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      UserName: process.env.JOBLOGIC_USERNAME,
      Password: process.env.JOBLOGIC_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`Joblogic auth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.Token || data.token,
    expiresAt: Date.now() + 55 * 60 * 1000, // refresh 5 min early
  };
  return cachedToken.value;
}

async function joblogicFetch(path: string, options: RequestInit = {}): Promise<unknown> {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Joblogic API error ${res.status}: ${body}`);
  }

  return res.json();
}

// ---- Jobs ----

export async function getJob(jobId: string | number) {
  return joblogicFetch(`/api/v2/jobs/${jobId}`);
}

export async function getJobs(params?: { page?: number; pageSize?: number; status?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  if (params?.status) query.set("status", params.status);
  return joblogicFetch(`/api/v2/jobs?${query}`);
}

export async function getJobsByCustomer(customerId: string | number) {
  return joblogicFetch(`/api/v2/jobs?customerId=${customerId}`);
}

// ---- Invoices ----

export async function getInvoice(invoiceId: string | number) {
  return joblogicFetch(`/api/v2/invoices/${invoiceId}`);
}

export async function getInvoices(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  return joblogicFetch(`/api/v2/invoices?${query}`);
}

// ---- Estimates / Quotes ----

export async function getEstimate(estimateId: string | number) {
  return joblogicFetch(`/api/v2/estimates/${estimateId}`);
}

export async function getEstimates(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  return joblogicFetch(`/api/v2/estimates?${query}`);
}

// ---- Customers ----

export async function getCustomer(customerId: string | number) {
  return joblogicFetch(`/api/v2/customers/${customerId}`);
}

export async function getCustomers(params?: { page?: number; pageSize?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  if (params?.search) query.set("search", params.search);
  return joblogicFetch(`/api/v2/customers?${query}`);
}

// ---- Work Orders ----

export async function getWorkOrder(workOrderId: string | number) {
  return joblogicFetch(`/api/v2/workorders/${workOrderId}`);
}

export async function getWorkOrders(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  return joblogicFetch(`/api/v2/workorders?${query}`);
}

// ---- Assets ----

export async function getAsset(assetId: string | number) {
  return joblogicFetch(`/api/v2/assets/${assetId}`);
}

export async function getAssets(params?: { page?: number; pageSize?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  return joblogicFetch(`/api/v2/assets?${query}`);
}

// ---- Engineers ----

export async function getEngineer(engineerId: string | number) {
  return joblogicFetch(`/api/v2/engineers/${engineerId}`);
}

export async function getEngineers() {
  return joblogicFetch(`/api/v2/engineers`);
}

/**
 * Resolves a natural language query to a Joblogic API call.
 * Used by the voice AI to map user intent to data retrieval.
 */
export async function resolveQuery(intent: string, entities: Record<string, string>): Promise<unknown> {
  switch (intent) {
    case "get_job_status":
      if (entities.jobId) return getJob(entities.jobId);
      return { error: "I need a job number to look that up." };

    case "get_invoice":
      if (entities.invoiceId) return getInvoice(entities.invoiceId);
      return { error: "I need an invoice number to look that up." };

    case "get_estimate":
      if (entities.estimateId) return getEstimate(entities.estimateId);
      return { error: "I need an estimate number to look that up." };

    case "get_customer":
      if (entities.customerId) return getCustomer(entities.customerId);
      if (entities.customerName) return getCustomers({ search: entities.customerName });
      return { error: "I need a customer name or ID." };

    case "list_jobs":
      return getJobs({ pageSize: 10, status: entities.status });

    case "list_invoices":
      return getInvoices({ pageSize: 10 });

    case "get_asset":
      if (entities.assetId) return getAsset(entities.assetId);
      return { error: "I need an asset ID to look that up." };

    case "get_engineer":
      if (entities.engineerId) return getEngineer(entities.engineerId);
      return getEngineers();

    default:
      return { error: "I'm not sure how to help with that. Try asking about a job, invoice, estimate, or customer." };
  }
}
