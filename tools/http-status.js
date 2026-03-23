import { BaseTool } from './base-tool.js';

const STATUSES = [
  // 1xx
  [100,'Continue','The server has received the request headers and the client should proceed.'],
  [101,'Switching Protocols','The requester has asked the server to switch protocols.'],
  [102,'Processing','The server has received and is processing the request (WebDAV).'],
  [103,'Early Hints','Used to return some response headers before final HTTP message.'],
  // 2xx
  [200,'OK','The request succeeded.'],
  [201,'Created','The request succeeded and a new resource was created.'],
  [202,'Accepted','The request has been received but not yet acted upon.'],
  [203,'Non-Authoritative Information','The returned metadata is from a local or third-party copy.'],
  [204,'No Content','There is no content to send for this request.'],
  [205,'Reset Content','Tells the client to reset the document view.'],
  [206,'Partial Content','Used for range requests.'],
  [207,'Multi-Status','Conveys information about multiple resources (WebDAV).'],
  [208,'Already Reported','Used inside a DAV binding to avoid enumerating members multiple times.'],
  [226,'IM Used','The server has fulfilled a GET request for the resource.'],
  // 3xx
  [300,'Multiple Choices','The request has more than one possible response.'],
  [301,'Moved Permanently','The URL of the requested resource has been changed permanently.'],
  [302,'Found','The URI of requested resource has been changed temporarily.'],
  [303,'See Other','The server sent this response to direct the client to get the resource at another URI with a GET request.'],
  [304,'Not Modified','Used for caching — the response has not been modified.'],
  [307,'Temporary Redirect','The server sends this response to direct the client to get the requested resource at another URI with the same method.'],
  [308,'Permanent Redirect','The resource is now permanently located at another URI.'],
  // 4xx
  [400,'Bad Request','The server cannot process the request due to a client error.'],
  [401,'Unauthorized','Authentication is required and has failed or not been provided.'],
  [402,'Payment Required','Reserved for future use.'],
  [403,'Forbidden','The client does not have access rights to the content.'],
  [404,'Not Found','The server cannot find the requested resource.'],
  [405,'Method Not Allowed','The request method is known by the server but is not supported.'],
  [406,'Not Acceptable','No content that conforms to the criteria given by the user agent.'],
  [407,'Proxy Authentication Required','Authentication is needed to be done by a proxy.'],
  [408,'Request Timeout','The server would like to shut down this unused connection.'],
  [409,'Conflict','The request conflicts with the current state of the server.'],
  [410,'Gone','The requested content has been permanently deleted from server.'],
  [411,'Length Required','Server rejected the request because the Content-Length header is not defined.'],
  [412,'Precondition Failed','The client has indicated preconditions in its headers which the server does not meet.'],
  [413,'Content Too Large','Request entity is larger than limits defined by server.'],
  [414,'URI Too Long','The URI requested by the client is longer than the server is willing to interpret.'],
  [415,'Unsupported Media Type','The media format of the requested data is not supported by the server.'],
  [416,'Range Not Satisfiable','The range specified by the Range header field cannot be fulfilled.'],
  [417,'Expectation Failed','The expectation indicated by the Expect request header cannot be met.'],
  [418,"I'm a Teapot","The server refuses the attempt to brew coffee with a teapot (RFC 2324)."],
  [421,'Misdirected Request','The request was directed at a server that is not able to produce a response.'],
  [422,'Unprocessable Content','The request was well-formed but was unable to be followed due to semantic errors.'],
  [423,'Locked','The resource that is being accessed is locked (WebDAV).'],
  [424,'Failed Dependency','The request failed due to failure of a previous request (WebDAV).'],
  [425,'Too Early','Indicates that the server is unwilling to risk processing a request that might be replayed.'],
  [426,'Upgrade Required','The server refuses to perform the request using the current protocol.'],
  [428,'Precondition Required','The origin server requires the request to be conditional.'],
  [429,'Too Many Requests','The user has sent too many requests in a given amount of time (rate limiting).'],
  [431,'Request Header Fields Too Large','The server is unwilling to process the request because its header fields are too large.'],
  [451,'Unavailable For Legal Reasons','The user agent requested a resource that cannot legally be provided.'],
  // 5xx
  [500,'Internal Server Error','The server has encountered a situation it does not know how to handle.'],
  [501,'Not Implemented','The request method is not supported by the server and cannot be handled.'],
  [502,'Bad Gateway','The server, while working as a gateway, got an invalid response.'],
  [503,'Service Unavailable','The server is not ready to handle the request (overloaded or down for maintenance).'],
  [504,'Gateway Timeout','The server is acting as a gateway and cannot get a response in time.'],
  [505,'HTTP Version Not Supported','The HTTP version used in the request is not supported by the server.'],
  [506,'Variant Also Negotiates','The server has an internal configuration error.'],
  [507,'Insufficient Storage','The method could not be performed because the server cannot store the representation (WebDAV).'],
  [508,'Loop Detected','The server detected an infinite loop while processing the request (WebDAV).'],
  [510,'Not Extended','Further extensions to the request are required for the server to fulfil it.'],
  [511,'Network Authentication Required','The client needs to authenticate to gain network access.'],
];

const COLOR = { 1: '#6366f1', 2: '#10b981', 3: '#f59e0b', 4: '#ef4444', 5: '#ec4899' };

export class HTTPStatus extends BaseTool {
  constructor(toast) { super('http-status', toast); }

  render(container) {
    this.container = container;
    container.innerHTML = `
      <div class="tool-panel glass-panel" style="padding:1.5rem;margin-bottom:1rem">
        <input type="search" id="hs-search" class="form-control" placeholder="Search by code or name… (e.g. 404, redirect, timeout)" style="font-family:var(--font-family)">
      </div>
      <div id="hs-list"></div>`;

    document.getElementById('hs-search').addEventListener('input', e => this.render_list(e.target.value));
    this.render_list('');
  }

  render_list(q) {
    const filtered = q
      ? STATUSES.filter(([code, name, desc]) =>
          String(code).includes(q) || name.toLowerCase().includes(q.toLowerCase()) || desc.toLowerCase().includes(q.toLowerCase()))
      : STATUSES;

    // Group by category
    const groups = {};
    filtered.forEach(s => {
      const cat = Math.floor(s[0] / 100);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });

    const catLabels = { 1:'1xx Informational', 2:'2xx Success', 3:'3xx Redirection', 4:'4xx Client Errors', 5:'5xx Server Errors' };

    document.getElementById('hs-list').innerHTML = Object.entries(groups).map(([cat, items]) => `
      <div style="margin-bottom:1.5rem">
        <h3 style="color:${COLOR[cat]};margin-bottom:0.75rem;font-size:1rem;text-transform:uppercase;letter-spacing:0.05em">${catLabels[cat]}</h3>
        ${items.map(([code, name, desc]) => `
          <div class="glass-panel" style="padding:1rem;margin-bottom:0.5rem;display:flex;gap:1rem;align-items:flex-start;cursor:pointer" onclick="navigator.clipboard.writeText('${code}')">
            <span style="font-family:'Fira Code',monospace;font-size:1.1rem;font-weight:700;color:${COLOR[cat]};min-width:48px">${code}</span>
            <div>
              <div style="font-weight:600;margin-bottom:0.2rem">${name}</div>
              <div style="font-size:0.85rem;color:var(--text-muted)">${desc}</div>
            </div>
          </div>`).join('')}
      </div>`).join('') || '<p style="color:var(--text-muted);text-align:center;padding:2rem">No results found.</p>';
  }
}
