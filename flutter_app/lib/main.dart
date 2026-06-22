import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config.dart';
import 'services/edge_functions.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey,
  );
  runApp(const PresentAiApp());
}

class PresentAiApp extends StatelessWidget {
  const PresentAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Present AI',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF7C3AED)),
        useMaterial3: true,
      ),
      home: const HomePage(),
    );
  }
}

/// Minimal starting point. The full editor/preview UI still needs to be built,
/// but auth + the backend client are wired so the lifecycle can be driven from
/// the same Edge Functions as the web app.
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final EdgeFunctions _api = EdgeFunctions(Supabase.instance.client);
  final _topic = TextEditingController();
  String _status = 'Bitte anmelden und ein Thema eingeben.';
  bool _busy = false;

  Future<void> _signIn() async {
    // Placeholder: wire a real email/password form here.
    setState(() => _status = 'Anmeldung: bitte E-Mail/Passwort-Formular ergänzen.');
  }

  Future<void> _generate() async {
    if (_topic.text.trim().isEmpty) return;
    setState(() {
      _busy = true;
      _status = 'Gliederung wird erstellt…';
    });
    try {
      final res = await _api.generateOutline(
        topic: _topic.text.trim(),
        gradeLevel: 'Oberstufe (11.-13. Klasse)',
        slideCount: 10,
        theme: {'id': 'school-fresh', 'name': 'Schul-Frisch'},
      );
      setState(() => _status = 'OK: ${res['presentationId']}');
    } catch (e) {
      setState(() => _status = 'Fehler: $e');
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Present AI')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _topic,
              decoration: const InputDecoration(
                labelText: 'Thema',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton(onPressed: _busy ? null : _generate, child: const Text('Gliederung erstellen')),
            const SizedBox(height: 8),
            OutlinedButton(onPressed: _signIn, child: const Text('Anmelden')),
            const SizedBox(height: 16),
            Text(_status),
          ],
        ),
      ),
    );
  }
}
