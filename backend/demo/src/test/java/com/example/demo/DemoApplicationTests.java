package com.example.demo;

<<<<<<< HEAD
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
	"spring.data.mongodb.uri=mongodb://localhost:27017/codecollab-test",
	"app.jwt.secret=test-secret-with-at-least-32-characters-long"
})
class DemoApplicationTests {

	@Autowired
	private WebApplicationContext webApplicationContext;
	private MockMvc mockMvc;

	@BeforeEach
	void setUpMockMvc() {
		mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
	}

=======
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

>>>>>>> 756de1679ca0efb7ccbb987f619ca511799d9d5a
	@Test
	void contextLoads() {
	}

<<<<<<< HEAD
	@Test
	void joiningRoomRequiresAuthentication() throws Exception {
		mockMvc.perform(post("/api/rooms/join")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"roomCode\":\"ROOM-1234\"}"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void openingRoomRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/rooms/room-123"))
			.andExpect(status().isUnauthorized());
	}

=======
>>>>>>> 756de1679ca0efb7ccbb987f619ca511799d9d5a
}
