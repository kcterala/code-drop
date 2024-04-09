package dev.kcterala.codejudge;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.command.BuildImageResultCallback;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.Frame;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Service
public class CodeService {

    final DockerClient dockerClient;
    static Map<Language, String> dockerImages = new HashMap<>();
    static final Logger logger = LoggerFactory.getLogger(CodeService.class);

    public static class CustomLogContainerResultCallback extends ResultCallback.Adapter<Frame> {
        private final List<String> output = new ArrayList<>();

        @Override
        public void onNext(Frame item) {
            output.add(new String(item.getPayload(), StandardCharsets.UTF_8).trim());
        }

        public List<String> getOutput() {
            return output;
        }
    }


    public CodeService() {
        DefaultDockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
        DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .sslConfig(config.getSSLConfig())
                .maxConnections(100)
                .connectionTimeout(Duration.ofSeconds(30))
                .responseTimeout(Duration.ofSeconds(45))
                .build();
        dockerClient = DockerClientImpl.getInstance(config, httpClient);
    }


    public void setupDockerImages() throws InterruptedException, IOException {
        logger.info("Setting up docker images");
        Arrays.stream(Language.values()).forEach(language -> {
            String directoryName = switch (language) {
                case JAVA -> "Java";
                case JS -> "JS";
                case GO -> "Go";
                case PYTHON -> "Python";
            };
            String imageId = buildImage(directoryName);
            dockerImages.put(language, imageId);
        });
    }

    private String buildImage(String directoryName) {
        logger.info("Bulding " + directoryName + " Image");
        File dockerfile = new File("DockerImages/" + directoryName + "/Dockerfile");
        BuildImageResultCallback buildImageResultCallback = new BuildImageResultCallback();
        return dockerClient.buildImageCmd()
                .withDockerfile(dockerfile)
                .exec(buildImageResultCallback)
                .awaitImageId();
    }


    public List<String> processCodeSnippet(CodeSnippet codeSnippet) throws IOException, InterruptedException {
        Language language = codeSnippet.language;
        String imageId = dockerImages.get(language);
        String extension = switch (language) {
            case JAVA -> ".java";
            case JS -> ".js";
            case GO -> ".go";
            case PYTHON -> ".py";
        };

        String fileName = switch (language) {
            case JAVA -> "Main";
            default -> "code";
        };

        File file = new File(fileName + extension);
        FileOutputStream fos = new FileOutputStream(file);
        fos.write(codeSnippet.code.getBytes(StandardCharsets.UTF_8));
        fos.close();
        long start = System.currentTimeMillis();
        logger.info("Creating Docker container");
        CreateContainerResponse container = dockerClient.createContainerCmd(imageId).exec();
        dockerClient.copyArchiveToContainerCmd(container.getId())
                .withHostResource(file.getAbsolutePath())
                .withRemotePath("/judge/")
                .exec();

        dockerClient.startContainerCmd(container.getId()).exec();


        CustomLogContainerResultCallback customLogContainerResultCallback = new CustomLogContainerResultCallback();

        // Capture output
        List<String> output;
        dockerClient.logContainerCmd(container.getId())
                .withStdOut(true)
                .withStdErr(true)
                .withFollowStream(true)
                .withTailAll()
                .exec(customLogContainerResultCallback).awaitCompletion();

        output = customLogContainerResultCallback.getOutput();


        output.forEach(System.out::println);

        dockerClient.removeContainerCmd(container.getId()).exec();
        logger.info("Removed Docker container - {}", System.currentTimeMillis() - start);
        long latency = System.currentTimeMillis() - start;
        logger.info("Time taken {} secs", latency / 1000);
        file.delete();
        return output;
    }
}
