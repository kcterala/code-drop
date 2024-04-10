package dev.kcterala.codejudge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@SpringBootApplication
@RestController
@CrossOrigin
public class CodejudgeApplication implements CommandLineRunner {

	@Autowired
	public CodeService codeService;
	Logger logger = LoggerFactory.getLogger(CodejudgeApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(CodejudgeApplication.class, args);
	}

	@Override
	public void run(final String... args) throws Exception {
		codeService.setupDockerImages();
	}

	@PostMapping("/submission")
	public ResponseEntity<String> processSubmission(@RequestBody CodeSnippet codeSnippet) throws IOException, InterruptedException {
		logger.info("Processing code with language {}", codeSnippet.language);
		List<String> strings = codeService.processCodeSnippet(codeSnippet);
		return ResponseEntity.ok(String.join("\n", strings));
	}

	@GetMapping("ping")
	public ResponseEntity<String> test() {
		return ResponseEntity.ok("pong ");
	}
}
