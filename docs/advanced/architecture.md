# Architecture

Understanding the internal architecture of AI Workflow Failure Summary Action.

## System Overview

```mermaid
graph TB
    subgraph "GitHub Actions Environment"
        WF[Workflow Fails]
        ACT[Action Triggered]
    end
    
    subgraph "AI Summary Action"
        INPUT[Parse Inputs]
        FETCH[Fetch Workflow Logs]
        PROC[Process Logs]
        LLM[LLM Client]
        FMT[Format Output]
    end
    
    subgraph "External Services"
        GH[GitHub API]
        OAI[OpenAI]
        ANT[Anthropic]
        AZ[Azure OpenAI]
        GHM[GitHub Models]
    end
    
    subgraph "Outputs"
        SUM[Actions Summary]
        ISS[GitHub Issue]
        OUT[Action Outputs]
    end
    
    WF --> ACT
    ACT --> INPUT
    INPUT --> FETCH
    FETCH --> GH
    GH --> PROC
    PROC --> LLM
    LLM -.->|Provider| OAI
    LLM -.->|Provider| ANT
    LLM -.->|Provider| AZ
    LLM -.->|Provider| GHM
    LLM --> FMT
    FMT --> SUM
    FMT --> ISS
    FMT --> OUT
```

## Component Architecture

### Core Components

#### 1. **Entry Point** (`src/index.ts`)

```mermaid
flowchart LR
    START([Action Start]) --> INPUTS[Get Inputs]
    INPUTS --> CONTEXT[Get GitHub Context]
    CONTEXT --> ANALYZE[Call Analyzer]
    ANALYZE --> OUTPUT[Set Outputs]
    OUTPUT --> SUMMARY[Write Summary]
    SUMMARY --> ISSUE{Create Issue?}
    ISSUE -->|Yes| CREATE[Create Issue]
    ISSUE -->|No| END([Action End])
    CREATE --> END
```

**Responsibilities:**
- Parse action inputs from workflow
- Get GitHub context (repo, run ID, etc.)
- Orchestrate the analysis workflow
- Handle errors and set outputs
- Create issues if requested

#### 2. **Analyzer** (`src/analyzer.ts`)

```mermaid
flowchart TB
    START([Analyze Request]) --> LOGS[Fetch Failed Job Logs]
    LOGS --> CHECK{Logs Found?}
    CHECK -->|No| EMPTY[Return Empty Result]
    CHECK -->|Yes| LLM[Initialize LLM Client]
    LLM --> PROMPTS[Load Prompts]
    PROMPTS --> CUSTOM{Custom Prompts?}
    CUSTOM -->|Yes| LOAD[Load from Files]
    CUSTOM -->|No| DEFAULT[Use Defaults]
    LOAD --> FORMAT
    DEFAULT --> FORMAT[Format Prompt]
    FORMAT --> INVOKE[Invoke LLM]
    INVOKE --> PARSE[Parse Response]
    PARSE --> RETURN[Return Analysis]
    EMPTY --> END([End])
    RETURN --> END
```

**Responsibilities:**
- Fetch workflow logs via GitHub API
- Load and process custom prompts
- Initialize appropriate LLM provider
- Format logs and prompts
- Invoke LLM for analysis
- Parse and return results

#### 3. **GitHub Client** (`src/github-client.ts`)

```mermaid
flowchart LR
    START([Client Request]) --> AUTH[Authenticate]
    AUTH --> JOBS[List Workflow Jobs]
    JOBS --> FILTER[Filter Failed Jobs]
    FILTER --> FETCH[Fetch Logs for Each]
    FETCH --> TRUNCATE[Truncate to Max Lines]
    TRUNCATE --> RETURN[Return Processed Logs]
    RETURN --> END([End])
```

**Responsibilities:**
- Authenticate with GitHub API
- Fetch workflow run information
- Get logs for failed jobs
- Truncate logs to configured limit
- Create issues with analysis results

## Data Flow

### Log Processing Pipeline

```mermaid
sequenceDiagram
    participant A as Action
    participant GH as GitHub API
    participant P as Processor
    participant L as LLM

    A->>GH: Get Workflow Run
    GH-->>A: Run Details
    
    A->>GH: List Jobs for Run
    GH-->>A: Job List
    
    A->>P: Filter Failed Jobs
    P-->>A: Failed Job IDs
    
    loop For Each Failed Job
        A->>GH: Download Logs
        GH-->>A: Raw Logs
        A->>P: Truncate to max-log-lines
        P-->>A: Processed Logs
    end
    
    A->>P: Format for LLM
    P-->>A: Formatted Prompt
    
    A->>L: Send for Analysis
    L-->>A: AI Summary
    
    A->>GH: Post Summary/Issue
```

### Prompt Resolution

```mermaid
flowchart TB
    START([Custom Prompt Input]) --> CHECK{Is File Path?}
    CHECK -->|No| INLINE[Use as Inline Text]
    CHECK -->|Yes| PATH{Path Exists?}
    PATH -->|No| WARN[Log Warning]
    PATH -->|Yes| READ[Read File Content]
    WARN --> INLINE
    READ --> PROCESS[Process Variables]
    INLINE --> PROCESS
    PROCESS --> RETURN[Return Final Prompt]
    RETURN --> END([End])
```

## LLM Provider Architecture

### Provider Selection

```mermaid
graph TB
    START([Provider Config]) --> SWITCH{Provider Type}
    
    SWITCH -->|openai| OAI[OpenAI Client]
    SWITCH -->|azure-openai| AZ[Azure OpenAI Client]
    SWITCH -->|github-models| GHM[GitHub Models Client]
    SWITCH -->|anthropic| ANT[Anthropic Client]
    
    OAI --> VALIDATE_OAI{API Key Valid?}
    AZ --> VALIDATE_AZ{Config Complete?}
    GHM --> VALIDATE_GHM{Token Valid?}
    ANT --> VALIDATE_ANT{API Key Valid?}
    
    VALIDATE_OAI -->|Yes| CREATE_OAI[Create ChatOpenAI]
    VALIDATE_AZ -->|Yes| CREATE_AZ[Create ChatOpenAI + Azure]
    VALIDATE_GHM -->|Yes| CREATE_GHM[Create ChatOpenAI + GitHub]
    VALIDATE_ANT -->|Yes| CREATE_ANT[Create ChatAnthropic]
    
    VALIDATE_OAI -->|No| ERROR
    VALIDATE_AZ -->|No| ERROR
    VALIDATE_GHM -->|No| ERROR
    VALIDATE_ANT -->|No| ERROR[Throw Error]
    
    CREATE_OAI --> RETURN[Return Client]
    CREATE_AZ --> RETURN
    CREATE_GHM --> RETURN
    CREATE_ANT --> RETURN
    
    RETURN --> END([End])
```

### LLM Invocation

```mermaid
sequenceDiagram
    participant A as Analyzer
    participant C as LLM Client
    participant P as Provider API
    
    A->>C: Initialize with Config
    C->>C: Validate Credentials
    
    A->>C: Invoke([SystemMessage, UserMessage])
    C->>C: Format Messages
    C->>P: HTTP Request
    
    alt Success
        P-->>C: Response with Content
        C->>C: Parse Response
        C-->>A: Return Content String
    else API Error
        P-->>C: Error Response
        C-->>A: Throw Error
    else Timeout
        P--xC: No Response
        C-->>A: Throw Timeout Error
    end
```

## State Management

The action is **stateless** - each execution is independent:

```mermaid
stateDiagram-v2
    [*] --> Initialize: Workflow Fails
    Initialize --> FetchLogs: Get Inputs
    FetchLogs --> Analyze: Logs Retrieved
    Analyze --> Output: Analysis Complete
    Output --> CreateIssue: Issue Enabled
    Output --> Finish: Issue Disabled
    CreateIssue --> Finish: Issue Created
    Finish --> [*]: Action Complete
    
    note right of Analyze
        No persistent state
        Fresh analysis each time
    end note
```

## Error Handling

```mermaid
flowchart TB
    START([Operation]) --> TRY{Try}
    TRY -->|Success| SUCCESS[Return Result]
    TRY -->|Error| CATCH[Catch Exception]
    
    CATCH --> TYPE{Error Type}
    
    TYPE -->|API Error| LOG_API[Log API Error]
    TYPE -->|Auth Error| LOG_AUTH[Log Auth Error]
    TYPE -->|Network Error| LOG_NET[Log Network Error]
    TYPE -->|Other| LOG_OTHER[Log Generic Error]
    
    LOG_API --> FAIL[Set Action Failed]
    LOG_AUTH --> FAIL
    LOG_NET --> FAIL
    LOG_OTHER --> FAIL
    
    SUCCESS --> END([End])
    FAIL --> END
```

**Error Handling Strategy:**
- All errors caught at entry point
- Specific error messages logged
- Action marked as failed with descriptive message
- No silent failures
- No partial outputs on error

## Security Architecture

```mermaid
graph TB
    subgraph "Input Layer"
        SECRETS[GitHub Secrets]
        INPUTS[Action Inputs]
    end
    
    subgraph "Processing Layer"
        MASK[Secret Masking]
        VALIDATE[Input Validation]
        SANITIZE[Log Sanitization]
    end
    
    subgraph "External Communication"
        TLS[TLS/HTTPS Only]
        AUTH[Authenticated Requests]
    end
    
    subgraph "Output Layer"
        SUMMARY[Sanitized Summary]
        ISSUE[Sanitized Issue]
    end
    
    SECRETS --> MASK
    INPUTS --> VALIDATE
    MASK --> SANITIZE
    VALIDATE --> SANITIZE
    SANITIZE --> TLS
    TLS --> AUTH
    AUTH --> SUMMARY
    AUTH --> ISSUE
```

**Security Measures:**
- Secrets never logged or exposed
- GitHub's automatic secret masking
- TLS for all external communication
- Authenticated API requests only
- Minimal permissions required
- No secret storage or persistence

## Performance Characteristics

### Time Complexity

```mermaid
gantt
    title Typical Action Execution Timeline
    dateFormat  s
    axisFormat %S
    
    section Initialization
    Parse Inputs     :a1, 0, 1s
    Get Context      :a2, after a1, 1s
    
    section Data Fetch
    Fetch Jobs       :b1, after a2, 2s
    Fetch Logs       :b2, after b1, 5s
    
    section Analysis
    Format Prompts   :c1, after b2, 1s
    LLM Request      :c2, after c1, 15s
    Parse Response   :c3, after c2, 1s
    
    section Output
    Write Summary    :d1, after c3, 1s
    Create Issue     :d2, after d1, 2s
```

**Average Execution Time:** 20-30 seconds
- Dominated by LLM API latency (10-20s)
- GitHub API calls: 3-5s
- Processing: <2s

### Resource Usage

- **Memory:** ~100MB (Node.js + dependencies)
- **CPU:** Minimal (I/O bound)
- **Network:** 
  - Logs download: varies by log size
  - LLM request: ~50KB (compressed)
  - LLM response: ~5-10KB

## Scalability

```mermaid
graph LR
    A[Single Repo] --> B[Multiple Workflows]
    B --> C[Many Failures]
    C --> D{Scaling Strategy}
    
    D --> E[Parallel Jobs]
    D --> F[Conditional Execution]
    D --> G[Rate Limiting]
    
    E --> H[Each Workflow = Separate Job]
    F --> I[Only Analyze New Failures]
    G --> J[Respect API Limits]
```

**Scalability Considerations:**
- Each workflow run is independent
- Parallel execution across repositories
- GitHub API rate limits apply
- LLM provider rate limits apply
- No shared state or bottlenecks

## Deployment Architecture

```mermaid
flowchart TB
    subgraph "Development"
        SRC[Source Code]
        BUILD[npm run build]
    end
    
    subgraph "Distribution"
        DIST[dist/ Directory]
        ACTION[action.yml]
    end
    
    subgraph "GitHub Registry"
        TAG[Version Tag]
        REF[Git Reference]
    end
    
    subgraph "Consumer Workflows"
        USER1[Repo A Workflow]
        USER2[Repo B Workflow]
        USER3[Repo C Workflow]
    end
    
    SRC --> BUILD
    BUILD --> DIST
    DIST --> TAG
    ACTION --> TAG
    TAG --> REF
    REF --> USER1
    REF --> USER2
    REF --> USER3
```

**Deployment Process:**
1. Code changes merged to main
2. `npm run build` compiles TypeScript
3. dist/ directory committed
4. Version tag created
5. Users reference tag in workflows

## Extension Points

Areas designed for customization:

```mermaid
mindmap
  root((Extension Points))
    Custom Prompts
      System Prompt
      User Prompt
      Template Variables
    LLM Providers
      Add New Provider
      Configure Existing
      Custom Models
    Output Formats
      Summary Format
      Issue Templates
      Custom Outputs
    Log Processing
      Custom Filters
      Format Handlers
      Truncation Logic
```

## Technology Stack

```yaml
Runtime: Node.js 20
Language: TypeScript 5.3+
Framework: GitHub Actions Toolkit
LLM Integration: LangChain
Bundler: Vercel ncc
Dependencies:
  - @actions/core: GitHub Actions SDK
  - @actions/github: GitHub API client
  - @langchain/openai: OpenAI integration
  - @langchain/anthropic: Anthropic integration
  - @langchain/core: LangChain base types
```

## Future Architecture Considerations

Potential enhancements:

1. **Caching Layer**: Cache similar failures to reduce LLM calls
2. **Learning System**: Learn from resolved issues
3. **Multi-Step Analysis**: Chain multiple LLM calls
4. **Streaming Responses**: Stream LLM output for faster feedback
5. **Webhook Integration**: Push notifications to external systems

## Next Steps

<!-- - [Security Best Practices](security.md)
- [Troubleshooting Guide](troubleshooting.md) -->
- [Contributing Guide](../contributing.md)
