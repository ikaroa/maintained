/**
 * Joblogic API Client
 * Integrates with the Joblogic Field Service Management REST API.
 * Docs: https://apidocs.joblogic.com/
 *
 * Auth: OAuth 2.0 Client Credentials
 * API version: v1
 * All search endpoints use POST /GetAll
 * All endpoints require tenantId query parameter
 */

const API_BASE_URL = process.env.JOBLOGIC_API_BASE_URL || "https://uatapi.joblogic.com";
const IDENTITY_URL = process.env.JOBLOGIC_IDENTITY_URL || "https://uatidentityserver.joblogic.com";
const TENANT_ID = process.env.JOBLOGIC_TENANT_ID || "";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.JOBLOGIC_CLIENT_ID || "",
    client_secret: process.env.JOBLOGIC_CLIENT_SECRET || "",
    scope: "JL.Api",
  });

  const res = await fetch(`${IDENTITY_URL}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`Joblogic auth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  // Token lifetime varies; refresh 5 minutes before expiry
  const expiresIn = (data.expires_in || 3600) * 1000;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + expiresIn - 5 * 60 * 1000,
  };
  return cachedToken.value;
}

function withTenant(path: string, extraParams?: Record<string, string>): string {
  const url = new URL(`${API_BASE_URL}/api/v1${path}`);
  url.searchParams.set("tenantId", TENANT_ID);
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

async function joblogicFetch(fullUrl: string, options: RequestInit = {}): Promise<unknown> {
  const token = await getAuthToken();
  const res = await fetch(fullUrl, {
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
  // Integer ID lookup
  const url = withTenant("/Job/GetById", { Id: String(jobId), includeAdditionalDetails: "true" });
  return joblogicFetch(url);
}

export async function getJobByUniqueId(uniqueId: string) {
  const url = withTenant("/Job", { id: uniqueId, includeAdditionalDetails: "true" });
  return joblogicFetch(url);
}

export async function searchJobs(keyword?: string, status?: string) {
  const url = withTenant("/Job/getall");
  return joblogicFetch(url, {
    method: "POST",
    body: JSON.stringify({
      keyword: keyword || "",
      ...(status ? { status } : {}),
    }),
  });
}

// ---- Invoices ----

export async function getInvoice(invoiceId: string | number) {
  const url = withTenant("/Invoice/GetById", { id: String(invoiceId) });
  return joblogicFetch(url);
}

export async function searchInvoices(keyword?: string) {
  const url = withTenant("/Invoice/getall");
  return joblogicFetch(url, {
    method: "POST",
    body: JSON.stringify({ keyword: keyword || "" }),
  });
}

// ---- Quotes / Estimates ----

export async function getQuote(quoteId: string | number) {
  const url = withTenant("/Quote/GetById", { Id: String(quoteId), includeLines: "true" });
  return joblogicFetch(url);
}

export async function searchQuotes(keyword?: string) {
  const url = withTenant("/Quote/GetAll");
  return joblogicFetch(url, {
    method: "POST",
    body: JSON.stringify({ keyword: keyword || "" }),
  });
}

// ---- Customers ----

export async function getCustomer(customerId: string | number) {
  const url = withTenant("/Customer/GetById", { id: String(customerId) });
  return joblogicFetch(url);
}

export async function getCustomerByUniqueId(uniqueId: string) {
  const url = withTenant("/Customer", { id: uniqueId });
  return joblogicFetch(url);
}

export async function searchCustomers(keyword: string) {
  const url = withTenant("/Customer/GetAll");
  return joblogicFetch(url, {
    method: "POST",
    body: JSON.stringify({ keyword }),
  });
}

// ---- Assets ----

export async function getAsset(assetId: string | number) {
  const url = withTenant("/Asset/GetById", { Id: String(assetId) });
  return joblogicFetch(url);
}

export async function searchAssets(keyword?: string) {
  const url = withTenant("/Asset/GetAll");
  return joblogicFetch(url, {
    method: "POST",
    body: JSON.stringify({ keyword: keyword || "" }),
  });
}

// ---- Engineers ----

export async function getEngineer(engineerId: string | number) {
  const url = withTenant("/Engineer/GetById", { Id: String(engineerId) });
  return joblogicFetch(url);
}

export async function searchEngineers(keyword?: string) {
  const url = withTenant("/Engineer/GetAll");
  return joblogicFetch(url, {
    method: "POST",
    body: JSON.stringify({ keyword: keyword || "" }),
  });
}

// ---- Sites ----

export async function getSite(siteId: string | number) {
  const url = withTenant("/Site/GetById", { Id: String(siteId) });
  return joblogicFetch(url);
}

export async function searchSites(keyword: string) {
  const url = withTenant("/Site/GetAll");
  return joblogicFetch(url, {
    method: "POST",
    body: JSON.stringify({ keyword }),
  });
}

// ---- Visits ----

export async function getVisit(visitId: string | number) {
  const url = withTenant("/Visit/GetById", { Id: String(visitId) });
  return joblogicFetch(url);
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
      if (entities.estimateId) return getQuote(entities.estimateId);
      return { error: "I need a quote or estimate number to look that up." };

    case "get_customer":
      if (entities.customerId) return getCustomer(entities.customerId);
      if (entities.customerName) return searchCustomers(entities.customerName);
      return { error: "I need a customer name or ID." };

    case "list_jobs":
      return searchJobs(entities.keyword, entities.status);

    case "list_invoices":
      return searchInvoices(entities.keyword);

    case "get_asset":
      if (entities.assetId) return getAsset(entities.assetId);
      return { error: "I need an asset ID to look that up." };

    case "get_engineer":
      if (entities.engineerId) return getEngineer(entities.engineerId);
      return searchEngineers(entities.keyword);

    case "get_site":
      if (entities.siteId) return getSite(entities.siteId);
      if (entities.siteName) return searchSites(entities.siteName);
      return { error: "I need a site name or ID." };

    default:
      return { error: "I'm not sure how to help with that. Try asking about a job, invoice, quote, customer, or asset." };
  }
}
