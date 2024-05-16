--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at") VALUES ('00000000-0000-0000-0000-000000000000', '4e7e3984-9f83-4a22-9309-9f963b088be1', 'authenticated', 'authenticated', 'hi@myleshaynes.com', '$2a$10$MAKAat/qNytnpboCZN/.ze6JbzdcKxOphKG1Z6of1WMyxJKiNLRHC', '2023-06-18 05:43:20.979467+00', NULL, '', NULL, '', NULL, '', '', NULL, '2023-06-23 23:12:51.775513+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-06-18 05:43:20.973896+00', '2023-06-24 00:11:42.096676+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);
--
-- Data for Name: map; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "public"."map" ("id", "owner", "created_at", "updated_at", "public", "name", "boundary", "description") VALUES ('100e977d-f8f4-4c8b-9404-84f05b13267d', '4e7e3984-9f83-4a22-9309-9f963b088be1', '2023-06-29 01:13:09.11829+00', '2023-06-29 01:13:09.11829+00', true, 'King County Wetlands', '{}', 'Download some data from king county''s wetland info');

--
-- Data for Name: map_dl_config; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "public"."map_dl_config" ("id", "owner", "map_id", "created_at", "updated_at", "name", "format", "access_key_id", "secret_key", "destination", "frequency", "where_clause", "active", "day_of_month", "days_of_week", "time_of_day") VALUES ('91a88515-3f12-4f14-ac54-3eb0eca2f63e', '4e7e3984-9f83-4a22-9309-9f963b088be1', '100e977d-f8f4-4c8b-9404-84f05b13267d', '2023-06-29 01:17:41.166838+00', '2023-06-29 01:17:41.166838+00', 'Name', 'pmtiles', 'dkdkdk', 'dkddkdk', 'https://download.config.data', 'daily', '', true, 1, '{}', '19:17:33');


--
-- Data for Name: layer; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "public"."layer" ("id", "owner", "created_at", "updated_at", "public", "name", "url", "description", "fields", "spatial_ref", "extent", "geometry_type", "query_formats") VALUES ('b44992ea-148f-477c-8af8-5d6f3155b8d1', '4e7e3984-9f83-4a22-9309-9f963b088be1', '2023-06-29 01:11:25.119977+00', '2023-06-29 01:12:24.210235+00', true, 'King County Wetlands', 'https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11', 'A wetland layers', '["hello"]', '4326', '0103000020E6100000010000000500000082D322F38CA35EC022B2CCB5E78D474082D322F38CA35EC05F377A2DE0E4474014EDC35493535EC05F377A2DE0E4474014EDC35493535EC022B2CCB5E78D474082D322F38CA35EC022B2CCB5E78D4740', 'esriGeometryPolygon', '{}');


--
-- Data for Name: layer_download_config; Type: TABLE DATA; Schema: public; Owner:
-- postgres
--
INSERT INTO "public"."layer_download_config" ("id", "layer_id", "column_mapping") VALUES ('675cb0b9-9ecc-4d99-8afb-59ddb3ced015', 'b44992ea-148f-477c-8af8-5d6f3155b8d1', '{"hello": "goodbye"}');


--
-- Data for Name: map_layer; Type: TABLE DATA; Schema: public; Owner: postgres
--
INSERT INTO "public"."map_layer" ("map_id", "layer_id") VALUES ('100e977d-f8f4-4c8b-9404-84f05b13267d', 'b44992ea-148f-477c-8af8-5d6f3155b8d1');
