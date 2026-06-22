import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config.dart';

/// Thin client around the Present AI Supabase Edge Functions.
///
/// This mirrors `servers/nextjs/lib/presentation-api.ts` so the mobile app and
/// the web app speak to exactly the same backend. Every function requires a
/// signed-in user (the gateway enforces `verify_jwt`).
class EdgeFunctions {
  EdgeFunctions(this._client);

  final SupabaseClient _client;

  Future<Map<String, dynamic>> _call(
    String name, {
    String method = 'POST',
    Map<String, dynamic>? body,
    Map<String, String>? params,
  }) async {
    final session = _client.auth.currentSession;
    final token = session?.accessToken;
    if (token == null) {
      throw Exception('Bitte zuerst anmelden, um diese Funktion zu nutzen.');
    }

    var uri = Uri.parse('${AppConfig.functionsUrl}/$name');
    if (params != null) uri = uri.replace(queryParameters: params);

    final headers = {
      'Content-Type': 'application/json',
      'apikey': AppConfig.supabaseAnonKey,
      'Authorization': 'Bearer $token',
    };

    late http.Response res;
    switch (method) {
      case 'GET':
        res = await http.get(uri, headers: headers);
        break;
      case 'PATCH':
        res = await http.patch(uri, headers: headers, body: jsonEncode(body));
        break;
      default:
        res = await http.post(uri, headers: headers, body: jsonEncode(body));
    }

    final data = res.body.isNotEmpty
        ? jsonDecode(res.body) as Map<String, dynamic>
        : <String, dynamic>{};
    if (res.statusCode >= 400) {
      throw Exception(data['error'] ?? 'Edge function $name failed (${res.statusCode})');
    }
    return data;
  }

  // --- Presentation lifecycle -------------------------------------------------

  Future<Map<String, dynamic>> generateOutline({
    required String topic,
    required String gradeLevel,
    String textDensity = 'compact',
    int slideCount = 10,
    Map<String, dynamic>? theme,
  }) =>
      _call('generate-outline', body: {
        'topic': topic,
        'gradeLevel': gradeLevel,
        'textDensity': textDensity,
        'slideCount': slideCount,
        'theme': theme,
      });

  Future<Map<String, dynamic>> approveOutline(String presentationId) =>
      _call('approve-outline', body: {'presentationId': presentationId});

  Future<Map<String, dynamic>> getPresentation(String id) =>
      _call('get-presentation', method: 'GET', params: {'id': id});

  Future<Map<String, dynamic>> updateSlide(
          String slideId, Map<String, dynamic> updates) =>
      _call('update-slide', method: 'PATCH', body: {'slideId': slideId, 'updates': updates});

  Future<Map<String, dynamic>> savePresentation(
          String presentationId, List<Map<String, dynamic>> slides) =>
      _call('save-presentation', body: {'presentationId': presentationId, 'slides': slides});

  // --- Media ------------------------------------------------------------------

  Future<Map<String, dynamic>> searchImages(String query,
          {int page = 1, int perPage = 9}) =>
      _call('search-images', method: 'GET', params: {
        'q': query,
        'page': '$page',
        'per_page': '$perPage',
      });

  Future<Map<String, dynamic>> searchIcons(String query, {int limit = 20}) =>
      _call('search-icons', method: 'GET', params: {'q': query, 'limit': '$limit'});

  /// AI image generation via Gemini ("Nano Banana").
  Future<Map<String, dynamic>> generateImage(String prompt) =>
      _call('generate-image', body: {'prompt': prompt});

  /// AI re-edit of a single slide.
  Future<Map<String, dynamic>> editSlide(String slideId, String prompt) =>
      _call('edit-slide', body: {'slideId': slideId, 'prompt': prompt});

  /// Chat assistant about the presentation.
  Future<Map<String, dynamic>> presentationChat(
          String presentationId, String message) =>
      _call('presentation-chat', body: {'presentationId': presentationId, 'message': message});
}
