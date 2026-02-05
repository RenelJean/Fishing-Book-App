# Fishing Platform

Welcome to the Fishing Platform project! This repository is designed to provide a comprehensive solution for fishing enthusiasts, featuring a mobile application, a web application, and a backend API. The platform includes various features, with a primary focus on the "Trophy" feature, which allows users to track and showcase their fishing achievements.

## Project Structure

The project is organized into several key directories:

- **apps/**: Contains the different applications (mobile, web, and API).
  - **mobile/**: The mobile application built with Expo.
  - **web/**: The web application.
  - **api/**: The backend API service.
  
- **packages/**: Contains shared packages and libraries.
  - **ui/**: A UI component library for reusable components.
  - **services/**: Contains services for API interactions.
  - **config/**: Configuration settings for the application.

- **features/**: Contains feature-specific implementations, including the Trophy feature.

- **docs/**: Documentation for the project, including architecture, growth strategies, and maintenance guidelines.

- **infra/**: Infrastructure-related files, including Docker and Kubernetes configurations.

- **scripts/**: Utility scripts for setting up and managing the development environment.

- **tests/**: Contains unit and end-to-end tests for the application.

## Getting Started

To get started with the Fishing Platform, follow these steps:

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd fishing-platform
   ```

2. **Install Dependencies**:
   Use pnpm to install the necessary dependencies for the entire workspace:
   ```
   pnpm install
   ```

3. **Run the Development Environment**:
   You can start the development server for the mobile app using:
   ```
   cd apps/mobile
   pnpm start
   ```

   For the web app, navigate to:
   ```
   cd apps/web
   pnpm start
   ```

   And for the API, run:
   ```
   cd apps/api
   pnpm start
   ```

## Trophy Feature

The Trophy feature allows users to:
- View a list of trophies they have earned.
- See detailed information about each trophy.
- Upload new trophy data.

The Trophy feature is implemented in the `apps/mobile/src/features/trophy` directory and includes components for listing and displaying trophies, as well as routes for navigation.

## Documentation

For detailed information on the architecture, growth strategies, and maintenance guidelines, please refer to the documentation in the `docs/` directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.