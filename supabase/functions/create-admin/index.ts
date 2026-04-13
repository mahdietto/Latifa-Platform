import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create admin user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@gmail.com",
      password: "admin123",
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    });

    if (createError) {
      // User might already exist
      if (createError.message.includes("already")) {
        // Get existing user
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const adminUser = users?.find(u => u.email === "admin@gmail.com");
        if (adminUser) {
          // Ensure admin role
          await supabaseAdmin.from("user_roles").upsert(
            { user_id: adminUser.id, role: "admin" },
            { onConflict: "user_id,role" }
          );
          return new Response(JSON.stringify({ success: true, message: "Admin role assigned to existing user" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
      throw createError;
    }

    // Assign admin role
    if (userData.user) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userData.user.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
    }

    return new Response(JSON.stringify({ success: true, message: "Admin created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
