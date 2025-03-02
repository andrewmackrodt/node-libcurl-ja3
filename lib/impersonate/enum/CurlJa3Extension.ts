/**
 * ```sh
 * grep -Rh '#define TLSEXT_TYPE' deps/curl-impersonate/build/boringssl-23768dca563c4e62d48bb3675e49e34955dced12/include/openssl | grep -v '\\' | sed -nE 's/.+ (TLSEXT.+)? (.+)/\1 = \2,/p'
 * ```
 */
export enum CurlJa3Extension {
  TLSEXT_TYPE_record_size_limit = 28,
  TLSEXT_TYPE_server_name = 0,
  TLSEXT_TYPE_status_request = 5,
  TLSEXT_TYPE_ec_point_formats = 11,
  TLSEXT_TYPE_signature_algorithms = 13,
  TLSEXT_TYPE_srtp = 14,
  TLSEXT_TYPE_application_layer_protocol_negotiation = 16,
  TLSEXT_TYPE_padding = 21,
  TLSEXT_TYPE_extended_master_secret = 23,
  TLSEXT_TYPE_quic_transport_parameters_legacy = 0xffa5,
  TLSEXT_TYPE_quic_transport_parameters = 57,
  TLSEXT_TYPE_cert_compression = 27,
  TLSEXT_TYPE_session_ticket = 35,
  TLSEXT_TYPE_supported_groups = 10,
  TLSEXT_TYPE_pre_shared_key = 41,
  TLSEXT_TYPE_early_data = 42,
  TLSEXT_TYPE_supported_versions = 43,
  TLSEXT_TYPE_cookie = 44,
  TLSEXT_TYPE_psk_key_exchange_modes = 45,
  TLSEXT_TYPE_certificate_authorities = 47,
  TLSEXT_TYPE_signature_algorithms_cert = 50,
  TLSEXT_TYPE_key_share = 51,
  TLSEXT_TYPE_renegotiate = 0xff01,
  TLSEXT_TYPE_delegated_credential = 34,
  TLSEXT_TYPE_application_settings_old = 17513,
  TLSEXT_TYPE_application_settings = 17613,
  TLSEXT_TYPE_encrypted_client_hello = 0xfe0d,
  TLSEXT_TYPE_ech_outer_extensions = 0xfd00,
  TLSEXT_TYPE_certificate_timestamp = 18,
  TLSEXT_TYPE_next_proto_neg = 13172,
  TLSEXT_TYPE_channel_id = 30032,
}
