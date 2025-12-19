## URL Shortener Service with Analytics

### Features

- **Short URL Generation:** Creates unique short URLs using custom encoding to prevent collisions.
- **Pseudo-Random Shortcodes:** Employs a range-based ticket generation system for randomness in short code creation.
- **Non-Blocking Redirection & Async Stats:** Achieves smooth user experience with non-blocking redirection and asynchronous stat generation.
- **Fast Analytics:** Provides quick access to total clicks, top browsers, device types, top referers, active hours, weekdays, and months.
- **Optional Expiry Config & Auto-Deletion:** Allows setting expiry for URLs and schedules automatic deletion of expired entries.

### Performance

- **Redis Caching:** Improves response times for frequently accessed data like analytics, original URLs, and recently created short URLs.
- **Kafka Asynchronous Processing:** Enables efficient handling of high traffic through asynchronous processing of analytics data.
- **MongoDB Indexing:** Optimizes read performance by utilizing indexes on frequently queried fields.
- **MongoDB Read Efficiency:** Leverages MongoDB's strengths for efficient data retrieval.

### System Flow

1. **Ticket Generation:** A TicketCollection is seeded with large ranges that are valid for one year, allowing for 100 million requests per month.
2. **User Management:** Users register, log in, and access functionalities through secure JWT authentication.
3. **Short URL Creation:** Users create short URLs for long ones, optionally setting expiration dates. Short URLs are unique for each long URL.
4. **Link Service Communication:** The Link Service interacts with the Ticket Service to obtain a unique integer from a range and atomically increments it (Mongodb Transactions).
5. **Shortcode Encoding:** The Link Service encodes the integer using custom encoding to create the final short URL.
6. **Redirection:** Users visiting a short URL are redirected to the original URL.
7. **Asynchronous Data Processing:** Information about the visit is published to a Kafka queue.
8. **Analytics Generation:** An Analytics Service subscribes to the Kafka queue and stores relevant data in MongoDB.
9. **Analytics Retrieval:** Authorized users can access analytics via various MongoDB aggregation queries.
10. **Scheduled Deletion:** A cron job runs daily at 1AM to delete expired URLs.

### Running Locally

1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the local Kafka service: `docker-compose -f docker-compose-kafka.yml up` (if using docker)
4. Start the application: `npm run start:dev`

### Running in Docker-Compose

1. Start the application: `npm run start:compose`

# Analytics Approach

## Referral Sources

Referral sources indicate the origin of traffic to the shortened URLs. To capture this information, we track the HTTP referrer header when a user clicks on a shortened URL. By parsing and storing this header, we can determine which websites or platforms are driving traffic to our URLs.

## Time-Based Click Analysis

Time-based click analysis provides information on when users are most active in clicking on shortened URLs. We achieve this by timestamping each click event and aggregating the data based on time intervals such as hours, weekdays, or months. This allows us to identify peak activity periods and optimize our marketing efforts or server resources accordingly.

## Browser and Device Types

Knowing the browsers and device types used by users to access shortened URLs helps in optimizing the user experience and tailoring content accordingly. We extract user-agent information from the HTTP request headers and parse it to identify the browser and device type. By aggregating this data, we can determine the most popular browsers and devices among our audience.

### Implementation Details

- **Kafka for Asynchronous Processing**: We leverage Kafka for processing click events asynchronously. When a user clicks on a shortened URL, a message containing relevant information is published to a Kafka topic. This ensures that the redirection process is non-blocking, and analytics data processing can occur independently of the user's request.

- **MongoDB for Analytics Storage**: MongoDB is used to store analytics data efficiently. We design the schema to support fast querying and aggregation of metrics such as referral sources, click timestamps, user agents, and other relevant information.

- **Aggregation Pipelines**: MongoDB's aggregation framework is utilized to perform complex analytics computations efficiently. Aggregation pipelines are constructed to group, filter, and project data based on various dimensions such as time intervals, referral sources, and user agents.
