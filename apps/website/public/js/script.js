document.addEventListener("DOMContentLoaded", function () {
  const waitlistForm = document.getElementById("waitlistForm");
  const emailInput = document.getElementById("email");
  const messageDiv = document.getElementById("message");

  // Add focus animation to input
  emailInput.addEventListener("focus", function () {
    this.parentElement.classList.add("focused");
  });

  emailInput.addEventListener("blur", function () {
    this.parentElement.classList.remove("focused");
  });

  waitlistForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // prevent refreshing the page

    // removing whitespaces from the email string
    const email = emailInput.value.trim();

    // Simple email validation
    if (!isValidEmail(email)) {
      showMessage("Please enter a valid email address", "error");
      shakeElement(emailInput);
      return;
    }

    // API request
    await createWaitlist(email);
  });

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = "message " + type;

    // Animate the message appearance
    messageDiv.style.opacity = "0";
    messageDiv.style.transform = "translateY(-10px)";

    setTimeout(() => {
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateY(0)";
    }, 10);
  }

  function shakeElement(element) {
    element.classList.add("shake");
    setTimeout(() => {
      element.classList.remove("shake");
    }, 600);
  }

  function animateSuccess() {
    const formGroup = document.querySelector(".form-group");
    formGroup.classList.add("success-animation");
    setTimeout(() => {
      formGroup.classList.remove("success-animation");
    }, 1000);
  }

  async function createWaitlist(email) {
    const button = document.getElementById("joinBtn");
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Processing...";

    // HTTP verb - GET, POST, PUT, PATCH, DELETE
    const response = await fetch(
      "https://waitlist-project-backend.onrender.com/waitlist",
      {
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );

    if (!response.ok) {
      // Show success message
      showMessage(
        "An error occurred while adding you to our waitlist!\nPlease try again later",
        "error"
      );
      // Reset button
      button.disabled = false;
      button.textContent = originalText;

      // Clear the form
      emailInput.value = "";
      return;
    }
    await response.json();

    // Show success message
    showMessage("You've been added to our waitlist!", "success");

    // Reset button
    button.disabled = false;
    button.textContent = originalText;

    // Clear the form
    emailInput.value = "";

    // Add success animation
    animateSuccess();
  }

  // Add CSS for animations
  const style = document.createElement("style");
  style.textContent = `
        .form-group.focused {
            box-shadow: 0 4px 20px rgba(93, 95, 239, 0.15);
        }
        
        .shake {
            animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .success-animation {
            animation: pulse 1s ease;
        }
        
        @keyframes shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px); }
            30%, 50%, 70% { transform: translateX(-4px); }
            40%, 60% { transform: translateX(4px); }
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(93, 95, 239, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(93, 95, 239, 0); }
            100% { box-shadow: 0 0 0 0 rgba(93, 95, 239, 0); }
        }
        
        .message {
            transition: all 0.3s ease;
        }
    `;
  document.head.appendChild(style);
});
