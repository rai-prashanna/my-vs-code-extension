import React, { useState, useRef, useEffect, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // highlight.js style
import MarkdownRenderer from "./MarkdownRenderer";
import { PrimeReactProvider } from "primereact/api";
import { Panel } from "primereact/panel";
import "./index.css";
import "./flags.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "primereact/resources/primereact.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Avatar } from "primereact/avatar";
import { Image } from "primereact/image";
import Robot from "./robot.svg";
import { ProgressBar } from "primereact/progressbar"; // ProgressBar component
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { CSSTransition } from "react-transition-group";
import "./fade.css"; // We'll define the fade CSS here
import QAComponent, { QAItem } from "./QAComponent";
import SpinnerComponent from "./MySpinner";

const markdown = `Answer Concise summary
- SSO is implemented with Devise + OmniAuth-style callbacks routed to a custom OmniauthCallbacksController. Provider metadata (SAML vs OAuth2, domain lists, client ids/secrets, slo URL) lives in SsoProvider records and is accessed via SsoProvider.get_sso_provider_by_email.
- The login flow either redirects the user to /users/auth/:provider (SessionsController#create) or receives the provider callback in OmniauthCallbacksController (dynamically defined provider actions + explicit google_oauth2).
- Provider payloads are turned into application users by User.from_omniauth / User.from_google_oauth2 (not shown). Session state for special SSO signing actions is persisted in Redis via ApplicationController#update_sso_params_session and read by ApplicationController#sso_params_session_reader.
- Web session cookies: Devise sign-in plus a permanent encrypted :username cookie (for ActionCable). API token rotation/revocation is handled by AuthTokenService and direct manipulation of user.authentication_token in API controllers.
- SLO / logout: SessionsController preserves SAML session info to perform a local SLO redirect if provider.idp_slo_target_url is present; it also clears cookies and invalidates sessions. API logout clears authentication_token and resets session.

Detailed reasoning and mapping to code

1) Controllers and modules that handle SSO login and callback flows
- OmniauthCallbacksController (primary callback handler)
  - Dynamically defines a method for each active SsoProvider: SsoProvider.where(active: true).find_each { |p| define_method p.name { generic_saml } } — so most providers invoke generic_saml when OmniAuth calls /users/auth/<provider>/callback.
  - Implements generic_saml which:
    - Detects signing_action via sso_params_session.present?
    - Calls User.from_omniauth(request.env['omniauth.auth'], signing_action:)
    - Handles subscription-related exceptions (SubscriptionError::UserLimitExceeded, HasExpired, EndedWarning) via handle_subscription_error
    - If user blank → flash alert and redirect
    - If signing_action (SSO signing/approval), calls reauthenticate_and_redirect which manipulates sso params and redirects to return_url
    - Otherwise calls sign_in_successfully (sets flash, cookie, sign_in_and_redirect)
  - Implements google_oauth2 (OAuth2 path) which calls User.from_google_oauth2 and otherwise follows similar flows (reatuh, sign in, store limited session data).
  - failure: if omniauth errors / user cancels, reads return_back_url from sso_params_session and redirects there else root_path.
  - passthru/action_missing: error/passthrough hooks.

- SessionsController (web Devise sessions)
  - On sign-in (create), if the commit is SSO sign-in it finds provider_name via SsoProvider.get_sso_provider_by_email(params[:username]) and redirect_post to "/users/auth/#{provider_name}" — this is how standard login UI redirects into the provider/OmniAuth flow.
  - On successful local sign-in, it sets cookies.permanent.encrypted[:username], queues UpdateTrackedFieldsJob, and handles subscription checks.
  - destroy (logout) preserves saml_uid/saml_session_index, calls generate_local_slo_logout_url (uses SsoProvider.get_sso_provider_by_email on current_user to derive provider and check idp_slo_target_url), deletes cookies, invalidates sessions, and then uses Devise’s sign out flow. After sign out it stores slo_logout_url in the session so after Devise clears the session the app can still redirect to the provider logout URL in after_sign_out_path_for.

- API controllers (Api::V2::SessionsController and Api::External::V1::SessionsController)
  - Handle token-based sign-in and sign-out.
  - Include TokenAuthenticatableHandler to authenticate by token; monkey-patch before_token_authentication to extract nested user params.
  - rotate_authentication_token uses AuthTokenService.new(user).fetch_or_rotate_token when Redis rotation is supported for equipment; otherwise uses user.authentication_token.
  - destroy clears authentication_token and reset_session (revocation for API clients).

- Reauthenticatable module
  - Provides reauthenticate! that conditionally yields depending on whether the user is SSO and whether the request is returning from the provider callback URL (uses SsoProviderDecorator.callback_url).

2) Where provider-specific logic / configuration is represented
- SsoProvider model
  - Stores provider metadata: sso_type enum (saml or oauth2), domain_names, issuer, oauth_client_id/secret, idp_slo_target_url, roles_matching JSON, active flag, and belongs_to organization.
  - Has helper methods:
    - safe_array_of_domain_names (parses domain_names)
    - safe_hash_of_role_matching (parses roles_matching JSON)
    - self.get_sso_provider_by_email(email) (extracts email domain and routes to get_provider_from_a_domain_name).
    - get_provider_from_a_domain_name scans active SsoProvider records and finds matching domain name.
  - domain_names_valid validation (forbidden consumer email domains for Pre-GMP).

- SsoProviderDecorator
  - Builds authorize_url and callback_url from provider root_url/name — used by reauth logic.

- Omniauth/Devise integration
  - The dynamic methods in OmniauthCallbacksController plus the SessionsController redirect to /users/auth/:provider are the glue to OmniAuth/Devise strategies. The comments reference initializers (/eris/config/initializers/devise_omniauth.rb) so provider registration and OmniAuth/Devise setup would be configured there (only referenced in comments in the snippets).

3) How users are mapped or created from provider data
- User.from_omniauth(request.env['omniauth.auth'], signing_action:) and User.from_google_oauth2(request.env['omniauth.auth']) are the application entry points to transform omniauth auth hashes into User records. (Implementation not shown.)
- If these methods return nil or blank, controllers flash an alert and redirect; exceptions (SubscriptionError.*) may be raised by from_omniauth and are handled by OmniauthCallbacksController.handle_subscription_error.
- User.sso_provider delegates to SsoProvider.get_sso_provider_by_email(email) (helper to find the provider from the user email).

4) How state and tokens are validated and persisted
- SSO transient state (return_url, return_back_url, signing actions, successful_sso_reauth flag) is stored in Redis:
  - ApplicationController#update_sso_params_session writes parameters JSON into Redis under key "sso-params-#{uuid}", expires after 600s, stores id in session[:sps], and caches @sso_params_session.
  - ApplicationController#sso_params_session_reader reads session.delete(:sps) to get id, reads REDIS.get(key), deletes the key, parses JSON and returns with_indifferent_access. This means the SSO params are single-use and short-lived.
  - ApplicationController#sso_params_session lazily initializes @sso_params_session from the reader.
  - OmniauthCallbacksController uses sso_params_session.present? to detect signing_action and uses sso_params_session.with_indifferent_access[:return_url] to redirect after reauth.

- Token rotation and validation (API)
  - TokenAuthenticatableHandler authenticates token requests. API controllers call rotate_authentication_token which uses AuthTokenService when redis rotation is supported; redis rotation support depends on equipment type and software_version (and Gem::Version comparison).
  - API logout clears current_user.authentication_token and saves or resets session.

- Session cookies for web
  - Successful SSO sign-in calls sign_in_and_redirect @user (Devise) and additionally sets cookies.permanent.encrypted[:username] with httponly and secure in production — this cookie is used by ActionCable authentication.
  - On logout cookies.permanent.encrypted[:username] and :eris_admin_authenticatable_token are deleted.

5) Logout and token revocation
- Web logout (SessionsController#destroy)
  - Preserves saml_uid/saml_session_index to support SAML SL0, builds local_slo_logout_url via generate_local_slo_logout_url which uses SsoProvider.get_sso_provider_by_email(current_user&.email) and checks provider.sso_type == 'saml' and provider.idp_slo_target_url presence.
  - After devise sign-out, session['slo_logout_url'] is set such that after_sign_out_path_for returns that URL and then clears it from session.
  - current_user.invalidate_all_sessions is called to invalidate server-side sessions (method on User not shown).

- API logout (Api::V2, Api::External::V1)
  - current_user.authentication_token = nil and save/reset_session — immediately revokes token for API clients.
  - Api::External::V1::SessionsController#create also resets the authentication token on login and returns JSON.

6) Subscription checks and special error flows
- User.from_omniauth and other user-creation/auth paths raise subscription-related exceptions that are handled centrally:
  - OmniauthCallbacksController rescues SubscriptionError::UserLimitExceeded and SubscriptionError::HasExpired / EndedWarning and calls handle_subscription_error which sets flash[:subscription_error] with subscription info (owner name/email/ended_at) and redirects to root.
  - SessionsController#create and API controllers also use user.with_subscription_validations to validate and raise Pundit::NotAuthorizedErrorWithJson or set flash subscription errors before proceeding.

7) Misc / hooks
- OmniauthCallbacksController defines a generic passthru and action_missing raising errors for unexpected flows.
- SessionsController and API controllers include TokenAuthenticatableHandler; both add a before_token_authentication override to extract nested username/password into top-level params.
- Reauthenticatable uses SsoProviderDecorator callback_url to avoid forcing reauth if returning directly from provider callback.

Putting it together — typical flows
- Web login via SSO button:
  1. User enters email on sign-in UI → SessionsController#create sees commit == "SSO sign in" and finds provider_name via SsoProvider.get_sso_provider_by_email(email).
  2. It redirect_post to /users/auth/:provider which is handled by OmniAuth/Devise strategies.
  3. The provider redirects back to /users/auth/:provider/callback which invokes OmniauthCallbacksController.<provider> (dynamically defined, usually routed to generic_saml) or google_oauth2.
  4. OmniauthCallbacksController reads request.env['omniauth.auth'] and calls User.from_omniauth/from_google_oauth2 to find or create a user.
  5. If this is a signing_action (SSO params present in Redis), reauthenticate_and_redirect modifies sso params and redirects to a supplied return_url; otherwise sign_in_and_redirect is called, cookie set for ActionCable.

- Logout:
  - Web: SessionsController#destroy deletes cookies, invalidates sessions, then redirects to SAML local SLO URL if configured (session stores slo_logout_url across Devise session deletion).
  - API: destroy clears authentication_token and resets session.

- API token rotation:
  - On API sign-in, rotate_authentication_token decides whether to use AuthTokenService to fetch/rotate token based on equipment and software_version. Tokens are stored/rotated (details inside AuthTokenService not shown).

Limitations / places configuration likely exists but not shown
- The actual OmniAuth provider registration and Devise OmniAuth initializer aren’t included here, but the code indicates they exist (comment referencing devise_omniauth.rb and dynamic controller methods). Provider secrets and client IDs are stored on SsoProvider for oauth2 and issuer/domain_names for saml.
- User.from_omniauth/from_google_oauth2, AuthTokenService, TokenAuthenticatableHandler implementation, and User.invalidate_all_sessions are not shown — they implement user creation/mapping, token generation/rotation, and session invalidation respectively.

If you want I can:
- Draw a call-flow diagram (web sign-in → redirect → callback → User.from_omniauth → sign-in), or
- List exactly which DB fields on SsoProvider are used for each decision (sso_type, domain_names, idp_slo_target_url, oauth_client_id/secret).! 
`;

const markdown1 = `Answer Concise summary
- SSO is implemented with Devise + OmniAuth-style callbacks routed to a custom OmniauthCallbacksController. Provider metadata (SAML vs OAuth2, domain lists, client ids/secrets, slo URL) lives in SsoProvider records and is accessed via SsoProvider.get_sso_provider_by_email.
- The login flow either redirects the user to /users/auth/:provider (SessionsController#create) or receives the provider callback in OmniauthCallbacksController (dynamically defined provider actions + explicit google_oauth2).
- Provider payloads are turned into application users by User.from_omniauth / User.from_google_oauth2 (not shown). Session state for special SSO signing actions is persisted in Redis via ApplicationController#update_sso_params_session and read by ApplicationController#sso_params_session_reader.
- Web session cookies: Devise sign-in plus a permanent encrypted :username cookie (for ActionCable). API token rotation/revocation is handled by AuthTokenService and direct manipulation of user.authentication_token in API controllers.
- SLO / logout: SessionsController preserves SAML session info to perform a local SLO redirect if provider.idp_slo_target_url is present; it also clears cookies and invalidates sessions. API logout clears authentication_token and resets session.

Detailed reasoning and mapping to code

1) Controllers and modules that handle SSO login and callback flows
- OmniauthCallbacksController (primary callback handler)
  - Dynamically defines a method for each active SsoProvider: SsoProvider.where(active: true).find_each { |p| define_method p.name { generic_saml } } — so most providers invoke generic_saml when OmniAuth calls /users/auth/<provider>/callback.
  - Implements generic_saml which:
    - Detects signing_action via sso_params_session.present?
    - Calls User.from_omniauth(request.env['omniauth.auth'], signing_action:)
    - Handles subscription-related exceptions (SubscriptionError::UserLimitExceeded, HasExpired, EndedWarning) via handle_subscription_error
    - If user blank → flash alert and redirect
    - If signing_action (SSO signing/approval), calls reauthenticate_and_redirect which manipulates sso params and redirects to return_url
    - Otherwise calls sign_in_successfully (sets flash, cookie, sign_in_and_redirect)
  - Implements google_oauth2 (OAuth2 path) which calls User.from_google_oauth2 and otherwise follows similar flows (reatuh, sign in, store limited session data).
  - failure: if omniauth errors / user cancels, reads return_back_url from sso_params_session and redirects there else root_path.
  - passthru/action_missing: error/passthrough hooks.

- SessionsController (web Devise sessions)
  - On sign-in (create), if the commit is SSO sign-in it finds provider_name via SsoProvider.get_sso_provider_by_email(params[:username]) and redirect_post to "/users/auth/#{provider_name}" — this is how standard login UI redirects into the provider/OmniAuth flow.
  - On successful local sign-in, it sets cookies.permanent.encrypted[:username], queues UpdateTrackedFieldsJob, and handles subscription checks.
  - destroy (logout) preserves saml_uid/saml_session_index, calls generate_local_slo_logout_url (uses SsoProvider.get_sso_provider_by_email on current_user to derive provider and check idp_slo_target_url), deletes cookies, invalidates sessions, and then uses Devise’s sign out flow. After sign out it stores slo_logout_url in the session so after Devise clears the session the app can still redirect to the provider logout URL in after_sign_out_path_for.

- API controllers (Api::V2::SessionsController and Api::External::V1::SessionsController)
  - Handle token-based sign-in and sign-out.
  - Include TokenAuthenticatableHandler to authenticate by token; monkey-patch before_token_authentication to extract nested user params.
  - rotate_authentication_token uses AuthTokenService.new(user).fetch_or_rotate_token when Redis rotation is supported for equipment; otherwise uses user.authentication_token.
  - destroy clears authentication_token and reset_session (revocation for API clients).

- Reauthenticatable module
  - Provides reauthenticate! that conditionally yields depending on whether the user is SSO and whether the request is returning from the provider callback URL (uses SsoProviderDecorator.callback_url).

2) Where provider-specific logic / configuration is represented
- SsoProvider model
  - Stores provider metadata: sso_type enum (saml or oauth2), domain_names, issuer, oauth_client_id/secret, idp_slo_target_url, roles_matching JSON, active flag, and belongs_to organization.
  - Has helper methods:
    - safe_array_of_domain_names (parses domain_names)
    - safe_hash_of_role_matching (parses roles_matching JSON)
    - self.get_sso_provider_by_email(email) (extracts email domain and routes to get_provider_from_a_domain_name).
    - get_provider_from_a_domain_name scans active SsoProvider records and finds matching domain name.
  - domain_names_valid validation (forbidden consumer email domains for Pre-GMP).

- SsoProviderDecorator
  - Builds authorize_url and callback_url from provider root_url/name — used by reauth logic.

- Omniauth/Devise integration
  - The dynamic methods in OmniauthCallbacksController plus the SessionsController redirect to /users/auth/:provider are the glue to OmniAuth/Devise strategies. The comments reference initializers (/eris/config/initializers/devise_omniauth.rb) so provider registration and OmniAuth/Devise setup would be configured there (only referenced in comments in the snippets).

3) How users are mapped or created from provider data
- User.from_omniauth(request.env['omniauth.auth'], signing_action:) and User.from_google_oauth2(request.env['omniauth.auth']) are the application entry points to transform omniauth auth hashes into User records. (Implementation not shown.)
- If these methods return nil or blank, controllers flash an alert and redirect; exceptions (SubscriptionError.*) may be raised by from_omniauth and are handled by OmniauthCallbacksController.handle_subscription_error.
- User.sso_provider delegates to SsoProvider.get_sso_provider_by_email(email) (helper to find the provider from the user email).

4) How state and tokens are validated and persisted
- SSO transient state (return_url, return_back_url, signing actions, successful_sso_reauth flag) is stored in Redis:
  - ApplicationController#update_sso_params_session writes parameters JSON into Redis under key "sso-params-#{uuid}", expires after 600s, stores id in session[:sps], and caches @sso_params_session.
  - ApplicationController#sso_params_session_reader reads session.delete(:sps) to get id, reads REDIS.get(key), deletes the key, parses JSON and returns with_indifferent_access. This means the SSO params are single-use and short-lived.
  - ApplicationController#sso_params_session lazily initializes @sso_params_session from the reader.
  - OmniauthCallbacksController uses sso_params_session.present? to detect signing_action and uses sso_params_session.with_indifferent_access[:return_url] to redirect after reauth.

- Token rotation and validation (API)
  - TokenAuthenticatableHandler authenticates token requests. API controllers call rotate_authentication_token which uses AuthTokenService when redis rotation is supported; redis rotation support depends on equipment type and software_version (and Gem::Version comparison).
  - API logout clears current_user.authentication_token and saves or resets session.

- Session cookies for web
  - Successful SSO sign-in calls sign_in_and_redirect @user (Devise) and additionally sets cookies.permanent.encrypted[:username] with httponly and secure in production — this cookie is used by ActionCable authentication.
  - On logout cookies.permanent.encrypted[:username] and :eris_admin_authenticatable_token are deleted.

5) Logout and token revocation
- Web logout (SessionsController#destroy)
  - Preserves saml_uid/saml_session_index to support SAML SL0, builds local_slo_logout_url via generate_local_slo_logout_url which uses SsoProvider.get_sso_provider_by_email(current_user&.email) and checks provider.sso_type == 'saml' and provider.idp_slo_target_url presence.
  - After devise sign-out, session['slo_logout_url'] is set such that after_sign_out_path_for returns that URL and then clears it from session.
  - current_user.invalidate_all_sessions is called to invalidate server-side sessions (method on User not shown).

- API logout (Api::V2, Api::External::V1)
  - current_user.authentication_token = nil and save/reset_session — immediately revokes token for API clients.
  - Api::External::V1::SessionsController#create also resets the authentication token on login and returns JSON.

6) Subscription checks and special error flows
- User.from_omniauth and other user-creation/auth paths raise subscription-related exceptions that are handled centrally:
  - OmniauthCallbacksController rescues SubscriptionError::UserLimitExceeded and SubscriptionError::HasExpired / EndedWarning and calls handle_subscription_error which sets flash[:subscription_error] with subscription info (owner name/email/ended_at) and redirects to root.
  - SessionsController#create and API controllers also use user.with_subscription_validations to validate and raise Pundit::NotAuthorizedErrorWithJson or set flash subscription errors before proceeding.

7) Misc / hooks
- OmniauthCallbacksController defines a generic passthru and action_missing raising errors for unexpected flows.
- SessionsController and API controllers include TokenAuthenticatableHandler; both add a before_token_authentication override to extract nested username/password into top-level params.
- Reauthenticatable uses SsoProviderDecorator callback_url to avoid forcing reauth if returning directly from provider callback.

Putting it together — typical flows
- Web login via SSO button:
  1. User enters email on sign-in UI → SessionsController#create sees commit == "SSO sign in" and finds provider_name via SsoProvider.get_sso_provider_by_email(email).
  2. It redirect_post to /users/auth/:provider which is handled by OmniAuth/Devise strategies.
  3. The provider redirects back to /users/auth/:provider/callback which invokes OmniauthCallbacksController.<provider> (dynamically defined, usually routed to generic_saml) or google_oauth2.
  4. OmniauthCallbacksController reads request.env['omniauth.auth'] and calls User.from_omniauth/from_google_oauth2 to find or create a user.
  5. If this is a signing_action (SSO params present in Redis), reauthenticate_and_redirect modifies sso params and redirects to a supplied return_url; otherwise sign_in_and_redirect is called, cookie set for ActionCable.

- Logout:
  - Web: SessionsController#destroy deletes cookies, invalidates sessions, then redirects to SAML local SLO URL if configured (session stores slo_logout_url across Devise session deletion).
  - API: destroy clears authentication_token and resets session.

- API token rotation:
  - On API sign-in, rotate_authentication_token decides whether to use AuthTokenService to fetch/rotate token based on equipment and software_version. Tokens are stored/rotated (details inside AuthTokenService not shown).

Limitations / places configuration likely exists but not shown
- The actual OmniAuth provider registration and Devise OmniAuth initializer aren’t included here, but the code indicates they exist (comment referencing devise_omniauth.rb and dynamic controller methods). Provider secrets and client IDs are stored on SsoProvider for oauth2 and issuer/domain_names for saml.
- User.from_omniauth/from_google_oauth2, AuthTokenService, TokenAuthenticatableHandler implementation, and User.invalidate_all_sessions are not shown — they implement user creation/mapping, token generation/rotation, and session invalidation respectively.

If you want I can:
- Draw a call-flow diagram (web sign-in → redirect → callback → User.from_omniauth → sign-in), or
- List exactly which DB fields on SsoProvider are used for each decision (sso_type, domain_names, idp_slo_target_url, oauth_client_id/secret).! 
## Code Example (JS)

\`\`\`javascript
function add(a, b) {
  return a + b;
}

console.log(add(2, 3));
\`\`\`

## Code Example (Python)

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Prashanna"))
\`\`\`
`;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [answer, setAnswer] = useState("");
  const [qaList, setQaList] = useState<QAItem[]>([]);

  const addQA = (newQA: QAItem): void => {
    setQaList((prev) => [...prev, newQA]);
  };

  const updateAnswer = (index: number, chunk: string): void => {
    setQaList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, answer: item.answer + chunk } : item
      )
    );
  };

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/stream");
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      // Check if this is the last message
      if (event.data === "#*✋🛑*#") {
        setLoading(false); // hide progress bar
        setIsStreaming(false); // stop streaming
        
      } else {
        setAnswer((prev) => prev + event.data);
        updateAnswer(qaList.length, event.data); 
      }
    };

    ws.onclose = () => {
      console.log("✅ WebSocket closed");
    };

    // disconnect only when window/tab is closed
    const handleBeforeUnload = () => {
      ws.close();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isStreaming]);

  const load = () => {
    setLoading(true);
    var raw_data = JSON.stringify({
      identifier: "START_🎬",
      question: question,
    });
    wsRef.current?.send(raw_data);
    setAsked(question);
    setIsStreaming(true);
    addQA({ asked: question, answer: "" });
  };

  const headerTemplate = () => {
    const className = `justify-content-space-between`;
    return (
      <div>
        <div className="flex">
          <Image
            className="mt-2 ml-2 inline"
            src={Robot}
            width="60px"
            height="40px"
          />
          <span className="ml-2 mt-4 font-bold inline">ERIS expert</span>
        </div>
      </div>
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    load();
  };

  return (
    <PrimeReactProvider>
      <div>
        <Card
          title="Ask me anything about eris codebase"
          header={headerTemplate}
        >
          {answer && (
            <div>
              {qaList.map((qa, index) => (
                <QAComponent asked={qa.asked} answer={qa.answer} />
              ))}
              {/* <QAComponent asked={asked} answer={answer}></QAComponent> */}
            </div>
          )}
        </Card>
        {/* <ReactMarkdown
        children={markdown}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      /> */}
        {loading && (
          <ProgressBar
            mode="indeterminate"
            style={{ height: "6px", width: "100%" }}
          />
        )}
        {loading && (<SpinnerComponent loading={answer === ''}/>)}
        <form onSubmit={handleSubmit}>
          <div className="flex items-center mt-2 ">
            <InputText
              className="flex-1 m-1"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
            />
            <Button
              className="m-1 bg-primary text-cyan-500"
              label="Submit"
              icon="pi pi-check"
              loading={loading}
              onClick={load}
            />
          </div>
        </form>
      </div>
    </PrimeReactProvider>
  );
}
